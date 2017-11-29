
const scenes = {
  mage_room: {
    name: 'mage_room',
    mobiles: ["mage"],
    furniture: ["chair"],
    links: ["mage_home_hall"],
  },

  mage_home_hall: {
    name: 'mage_home_hall',
    mobiles: ["tricky_bell"],
    furniture: ["mage_home_door", "mage_home_cellar_door", "mage_home_shelf"],
    links: ['mage_room', 'mage_home_cellar'],
  },

  mage_home_cellar: {
    name: 'mage_home_cellar',
    mobiles: [],
    furniture: ["chest"],
    links: ['mage_home_hall'],
  }
};

export default scenes;
