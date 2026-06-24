const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const pool = require('../db/pool');

// PUBLIC: Create reservation (no auth needed)
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received reservation data:', req.body);
    
    const {
      customer_name,
      email,
      phone_number,
      reservation_date,
      reservation_time,
      guests,
      table_preference,
      occasion,
      special_requests,
      original_time_ethiopian,
      timezone
    } = req.body;

    // Validation
    if (!customer_name || !phone_number || !reservation_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use the Ethiopian time directly - NO CONVERSION!
    const ethiopianTimeToStore = original_time_ethiopian || reservation_time;
    
    // Ensure guests is a number
    const guestCount = guests ? parseInt(guests) : 1;

    const result = await pool.query(
      `INSERT INTO reservations 
       (customer_name, email, phone_number, reservation_date, reservation_time, 
        guests, table_preference, occasion, special_requests, status,
        original_time_ethiopian, timezone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11) 
       RETURNING *`,
      [
        customer_name, 
        email || null,
        phone_number, 
        reservation_date,      // Store as-is (Ethiopian date)
        ethiopianTimeToStore,  // Store as-is (e.g., "8:00 AM")
        guestCount,
        table_preference || 'any', 
        occasion || 'regular', 
        special_requests || '', 
        ethiopianTimeToStore,  // Store original Ethiopian time
        timezone || 'Africa/Addis_Ababa'
      ]
    );

    console.log('✅ Reservation created successfully, ID:', result.rows[0].id);
    res.status(201).json({ success: true, reservation: result.rows[0] });
    
  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// PROTECTED: Get all reservations
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations ORDER BY reservation_date DESC, id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PROTECTED: Get single reservation
router.get('/:id', verifyToken, authorize('admin', 'manager'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PROTECTED: Update reservation status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, cancelled_by } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const current = await pool.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = current.rows[0];

    // Allow 'cancelled' through even when expired — frontend needs this to sync state
    if (reservation.status === 'pending' && isExpiredEthiopian(reservation.reservation_date, reservation.original_time_ethiopian) && status !== 'cancelled') {
      return res.status(400).json({
        error: `Cannot update. Reservation has expired (deadline was 30 minutes before ${reservation.original_time_ethiopian} Ethiopian time).`
      });
    }

    const result = await pool.query(
      'UPDATE reservations SET status = $1, cancelled_by = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, cancelled_by || null, req.params.id]
    );

    res.json({ success: true, reservation: result.rows[0] });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { reservation_date, reservation_time, original_time_ethiopian, guests } = req.body;

    const current = await pool.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const timeToStore = original_time_ethiopian || reservation_time;

    const result = await pool.query(
      `UPDATE reservations 
       SET reservation_date = $1, 
           reservation_time = $2, 
           original_time_ethiopian = $3,
           guests = $4,
           updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [reservation_date, timeToStore, timeToStore, guests, req.params.id]
    );

    res.json({ success: true, reservation: result.rows[0] });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PROTECTED: Delete reservation (admin only)
router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reservations WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function parseEthiopianTimeToMinutes(ethiopianTimeStr) {
  if (!ethiopianTimeStr) return 0;

  const match = ethiopianTimeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const modifier = match[3].toUpperCase();

  // Convert Ethiopian 12-hour to Ethiopian 24-hour first
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  // Ethiopian time is 6 hours AHEAD of Western 12-hour display
  // 5:00 AM Ethiopian = 11:00 AM Western = 11*60 = 660 minutes
  // Add 6 hours to convert to real/Western minutes for comparison
  let realMinutes = (hours * 60 + minutes) + (6 * 60);

  // Keep within 24 hours
  realMinutes = realMinutes % (24 * 60);

  return realMinutes;
}

function isExpiredEthiopian(reservationDate, ethiopianTimeStr) {
  const now = new Date();

  // Today's date in UTC+3 (Ethiopian date)
  const ethiopianNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  const today = ethiopianNow.toISOString().split('T')[0];

  // Current time in Western minutes (plain server local time)
  // Since server is UTC, add 3hrs to get Ethiopian wall-clock
  // But reservation minutes are already converted to Western via parseEthiopianTimeToMinutes
  // So compare both in the same "Western" space
  const currentTotalMinutes = ethiopianNow.getUTCHours() * 60 + ethiopianNow.getUTCMinutes();

  // This now returns Western-equivalent minutes (e.g. 5:00 AM ET → 660)
  const reservationTotalMinutes = parseEthiopianTimeToMinutes(ethiopianTimeStr);
  const deadlineMinutes = reservationTotalMinutes - 30;

  console.log('Expiry check:', {
    today,
    reservationDate,
    currentWesternMinutes: currentTotalMinutes,
    reservationWesternMinutes: reservationTotalMinutes,
    deadlineMinutes,
    isExpired: reservationDate === today && currentTotalMinutes > deadlineMinutes
  });

  if (reservationDate < today) return true;
  if (reservationDate === today && currentTotalMinutes > deadlineMinutes) return true;

  return false;
}

module.exports = router;