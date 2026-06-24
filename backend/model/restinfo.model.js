const pool = require("../db/pool");

class RestInfo {
  // Get all restaurant info from all tables
  static async getInfo() {
    try {
      // Get main settings
      const settingsResult = await pool.query(`
        SELECT * FROM restaurant_info1 LIMIT 1
      `);
      
      if (settingsResult.rows.length === 0) {
        return null;
      }
      
      const settings = settingsResult.rows[0];
      
      // Get hero section
      const heroResult = await pool.query(`
        SELECT * FROM hero_section WHERE id = $1
      `, [settings.id]);
      
      // Get about section (restaurant_info2)
      const aboutResult = await pool.query(`
        SELECT * FROM restaurant_info2 WHERE id = $1
      `, [settings.id]);
      
      // Get stats
      const statsResult = await pool.query(`
        SELECT * FROM stats WHERE restaurant_id = $1 AND is_active = true ORDER BY display_order
      `, [settings.id]);
      
      // Get core values
      const valuesResult = await pool.query(`
        SELECT * FROM core_values WHERE restaurant_id = $1 AND is_active = true ORDER BY display_order
      `, [settings.id]);
      
      // Get team members
      const teamResult = await pool.query(`
        SELECT * FROM team_members WHERE restaurant_id = $1 AND is_active = true ORDER BY display_order
      `, [settings.id]);
      
      // Get milestones
      const milestonesResult = await pool.query(`
        SELECT * FROM milestones WHERE restaurant_id = $1 AND is_active = true ORDER BY display_order
      `, [settings.id]);
      
      // Get business hours
      const hoursResult = await pool.query(`
        SELECT * FROM business_hours WHERE restaurant_id = $1 ORDER BY 
          CASE day_of_week 
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
          END
      `, [settings.id]);
      
      // Get social media
      const socialResult = await pool.query(`
        SELECT * FROM social_media WHERE restaurant_id = $1 AND is_active = true
      `, [settings.id]);
      
      // Get CTA section
      const ctaResult = await pool.query(`
        SELECT * FROM cta_section WHERE id = $1
      `, [settings.id]);
      
      // Combine all data
      return {
        // Main settings
        restaurant_name: settings.restaurant_name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        
        // Hero section
        hero_title: heroResult.rows[0]?.title || "",
        hero_subtitle: heroResult.rows[0]?.subtitle || "",
        hero_image: heroResult.rows[0]?.image_url || "",
        hero_button_text: heroResult.rows[0]?.button_text || "",
        hero_button_link: heroResult.rows[0]?.button_link || "",
        
        // About section (from restaurant_info2)
        about_title: aboutResult.rows[0]?.title || "",
        about_description_1: aboutResult.rows[0]?.description_1 || "",
        about_description_2: aboutResult.rows[0]?.description_2 || "",
        about_description_3: aboutResult.rows[0]?.description_3 || "",
        about_image: aboutResult.rows[0]?.image_url || "",
        
        // Stats section
        stats_title: "Our Achievements",
        stats_subtitle: "Numbers that speak for themselves",
        stats: statsResult.rows.map(stat => ({
          id: stat.id,
          number: stat.number,
          label: stat.label,
          icon: stat.icon_name
        })),
        
        // Values section
        values_title: "Our Values",
        values_subtitle: "The principles that guide everything we do",
        values: valuesResult.rows.map(value => ({
          id: value.id,
          title: value.title,
          description: value.description,
          icon: value.icon_name
        })),
        
        // Team section
        team_title: "Meet Our Team",
        team_subtitle: "The talented individuals behind your favorite dishes",
        team: teamResult.rows.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          description: member.description,
          image: member.image_url,
          email: member.email
        })),
        
        // Milestones section
        milestones_title: "Our Milestones",
        milestones: milestonesResult.rows.map(milestone => ({
          id: milestone.id,
          year: milestone.year,
          title: milestone.title,
          description: milestone.description
        })),
        
        // CTA section
        cta_title: ctaResult.rows[0]?.title || "",
        cta_subtitle: ctaResult.rows[0]?.subtitle || "",
        cta_button1_text: ctaResult.rows[0]?.button_1_text || "",
        cta_button2_text: ctaResult.rows[0]?.button_2_text || "",
        
        // Business hours
        business_hours: hoursResult.rows.map(hour => ({
          day: hour.day_of_week,
          open: hour.is_closed ? "Closed" : `${hour.open_time} - ${hour.close_time}`,
          is_closed: hour.is_closed
        })),
        
        // Social media
        social_media: socialResult.rows.map(social => ({
          platform: social.platform,
          url: social.url
        }))
      };
    } catch (error) {
      console.error("Error getting restaurant info:", error);
      throw error;
    }
  }

  // Update specific section
  static async updateSection(section, data) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      switch(section) {
        case 'hero':
          await client.query(
            `UPDATE hero_section SET 
              title = COALESCE($1, title),
              subtitle = COALESCE($2, subtitle),
              image_url = COALESCE($3, image_url),
              button_text = COALESCE($4, button_text),
              button_link = COALESCE($5, button_link),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1`,
            [data.title, data.subtitle, data.image_url, data.button_text, data.button_link]
          );
          break;
          
        case 'about':
          await client.query(
            `UPDATE restaurant_info2 SET 
              title = COALESCE($1, title),
              description_1 = COALESCE($2, description_1),
              description_2 = COALESCE($3, description_2),
              description_3 = COALESCE($4, description_3),
              image_url = COALESCE($5, image_url),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1`,
            [data.title, data.description_1, data.description_2, data.description_3, data.image_url]
          );
          break;
          
        case 'cta':
          await client.query(
            `UPDATE cta_section SET 
              title = COALESCE($1, title),
              subtitle = COALESCE($2, subtitle),
              button_1_text = COALESCE($3, button_1_text),
              button_2_text = COALESCE($4, button_2_text),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1`,
            [data.title, data.subtitle, data.button_1_text, data.button_2_text]
          );
          break;
          
        case 'settings':
          await client.query(
            `UPDATE restaurant_info1 SET 
              restaurant_name = COALESCE($1, restaurant_name),
              email = COALESCE($2, email),
              phone = COALESCE($3, phone),
              address = COALESCE($4, address),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1`,
            [data.restaurant_name, data.email, data.phone, data.address]
          );
          break;
      }
      
      await client.query('COMMIT');
      return await this.getInfo();
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Add new stat
  static async addStat(stat) {
    const result = await pool.query(
      `INSERT INTO stats (restaurant_id, number, label, icon_name, display_order) 
       VALUES (1, $1, $2, $3, $4) 
       RETURNING *`,
      [stat.number, stat.label, stat.icon_name, stat.display_order || 0]
    );
    return result.rows[0];
  }

  // Update stat
  static async updateStat(id, data) {
    const result = await pool.query(
      `UPDATE stats SET 
        number = COALESCE($1, number),
        label = COALESCE($2, label),
        icon_name = COALESCE($3, icon_name),
        display_order = COALESCE($4, display_order)
      WHERE id = $5 AND restaurant_id = 1
      RETURNING *`,
      [data.number, data.label, data.icon_name, data.display_order, id]
    );
    return result.rows[0];
  }

  // Delete stat
  static async deleteStat(id) {
    const result = await pool.query(
      `DELETE FROM stats WHERE id = $1 AND restaurant_id = 1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Add team member
  static async addTeamMember(member) {
    const result = await pool.query(
      `INSERT INTO team_members (restaurant_id, name, role, description, image_url, email, display_order) 
       VALUES (1, $1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [member.name, member.role, member.description, member.image_url, member.email, member.display_order || 0]
    );
    return result.rows[0];
  }

  // Update team member
  static async updateTeamMember(id, data) {
    const result = await pool.query(
      `UPDATE team_members SET 
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        description = COALESCE($3, description),
        image_url = COALESCE($4, image_url),
        email = COALESCE($5, email),
        display_order = COALESCE($6, display_order)
      WHERE id = $7 AND restaurant_id = 1
      RETURNING *`,
      [data.name, data.role, data.description, data.image_url, data.email, data.display_order, id]
    );
    return result.rows[0];
  }

  // Delete team member
  static async deleteTeamMember(id) {
    const result = await pool.query(
      `DELETE FROM team_members WHERE id = $1 AND restaurant_id = 1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Add milestone
  static async addMilestone(milestone) {
    const result = await pool.query(
      `INSERT INTO milestones (restaurant_id, year, title, description, display_order) 
       VALUES (1, $1, $2, $3, $4) 
       RETURNING *`,
      [milestone.year, milestone.title, milestone.description, milestone.display_order || 0]
    );
    return result.rows[0];
  }

  // Update milestone
  static async updateMilestone(id, data) {
    const result = await pool.query(
      `UPDATE milestones SET 
        year = COALESCE($1, year),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        display_order = COALESCE($4, display_order)
      WHERE id = $5 AND restaurant_id = 1
      RETURNING *`,
      [data.year, data.title, data.description, data.display_order, id]
    );
    return result.rows[0];
  }

  // Delete milestone
  static async deleteMilestone(id) {
    const result = await pool.query(
      `DELETE FROM milestones WHERE id = $1 AND restaurant_id = 1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = RestInfo;