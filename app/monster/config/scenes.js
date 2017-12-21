
const scenes = {
  mage_room: {
    name: 'mage_room',
    mobiles: ["mage"],
    furniture: ["chair"],
    links: ["mage_home_hall", "mage_home_vallo_room"],
  },

  mage_home_hall: {
    name: 'mage_home_hall',
    mobiles: ["tricky_bell"],
    furniture: ["mage_home_door", "mage_home_cellar_door", "mage_home_shelf"],
    links: ['mage_room', 'mage_home_cellar'], // mage_home_outdoor
  },

  mage_home_cellar: {
    name: 'mage_home_cellar',
    mobiles: [],
    furniture: ["chest"],
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
