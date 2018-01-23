
const scenes = {
  mage_room: {
    name: 'mage_room',
    mobiles: ["mage"],
    furniture: ["mage_room_table", "mage_room_shelf", "mage_room_bed"],
    links: ["mage_home_hall", "mage_home_vallo_room"],
  },

  mage_home_hall: {
    name: 'mage_home_hall',
    mobiles: ["tricky_bell"],
    furniture: ["mage_home_hall_door", "mage_home_hall_cellar_door", "mage_home_hall_shelf"],
    links: ['mage_room', 'mage_home_cellar'], // mage_home_outdoor
  },

  mage_home_cellar: {
    name: 'mage_home_cellar',
    mobiles: [],
    furniture: [
      "mage_home_cellar_blue_seaweeds",
      "mage_home_cellar_mushrooms",
      "mage_home_cellar_well",
      "mage_home_cellar_kitchen",
      "mage_home_cellar_bed",
      "mage_home_cellar_chest",
    ],
    links: ['mage_home_hall'],
  },

  mage_home_vallo_room: {
    name: 'mage_home_vallo_room',
    mobiles: [],
    furniture: ['mage_home_vallo_room_books', 'mage_home_vallo_room_nest'],
    links: ['mage_room', 'mage_home_loft'],
  },

  mage_home_loft: {
    name: 'mage_home_loft',
    mobiles: [],
    furniture: [
      'mage_home_loft_portal',
      'mage_home_loft_book_shelf',
      'mage_home_loft_bottles_rack',
      'mage_home_loft_big_basket',
      'mage_home_loft_trash_pile',
    ],
    links: ['mage_home_vallo_room'],
  }
};

export default scenes;
