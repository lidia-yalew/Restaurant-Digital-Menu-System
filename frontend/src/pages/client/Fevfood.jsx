import React from 'react'

function Fevfood() {
  // Mock user favorites data (you'll get this from backend/context)
  const userFavorites = [
    {
      id: 1,
      name: "Spicy Salmon Roll",
      category: "Sushi",
      price: "$18",
      orderCount: 3,
    },
    {
      id: 2,
      name: "Truffle Pasta",
      category: "Pasta",
      price: "$24",
      orderCount: 5,
    },
    {
      id: 3,
      name: "Chocolate Lava",
      category: "Dessert",
      price: "$12",
      orderCount: 4,
    },
  ];
  return (
    <div>
      {/* RECOMMENDED SECTION - ABOVE MENU */}
      <div className="mb-10 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-6">
          <span className="text-green-400">🍽️ Recommended For You</span>
        </h2>

        {/* Personal Greeting */}
        <div className="text-center mb-6">
          <p className="text-text text-lg">
            Based on your{" "}
            <span className="text-primary font-bold">3 previous orders</span>,
            you might love these:
          </p>
        </div>

        {/* Favorites Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          {userFavorites.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-4 border border-white/20 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-text text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm">{item.category}</p>
                </div>
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                  Ordered {item.orderCount}×
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-green-400 font-bold">{item.price}</span>
                <button className="text-sm bg-green-400 text-white px-3 py-1 rounded-full hover:bg-green-500">
                  Reorder
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Action */}
        <div className="text-center">
          <Button2 text="Quick Reorder All" size="lg" className="mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default Fevfood
