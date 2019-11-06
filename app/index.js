// @flow
/* eslint-disable global-require */
const href = window.location.href

// FIXME awful manual routing. rewrite it to react router.
// but need to rewrite concept of drawer.js for this, as drawer calls initDrawer() after rendering app
if (href.match('moving_arrows.html')) {
  require('experimental/moving_arrows')
}
if (href.match('planets_focus.html')) {
  require('experimental/planets_focus')
}
if (href.match('basic_tableau.html')) {
  require('experimental/basic_random_tableau')
}
if (href.match('smooth_tableau.html')) {
  require('experimental/tableau_smooth')
}
if (href.match('rule_30.html')) {
  require('experimental/rule_30')
}
if (href.match('vichniac_vote.html')) {
  require('experimental/vichniac_vote')
}
if (href.match('orbits.html')) {
  require('experimental/orbits')
}
if (href.match('luna.html')) {
  require('experimental/luna')
}
if (href.match('wavy_sphere.html')) {
  require('experimental/planet_exp_2')
}

if (href.match('samples_collection.html')) {
  require('experimental/samples_collection_init')
}
if (href.match('samples_collection.html')) {
  require('experimental/samples_collection_init')
}
require('experimental/samples_collection_init')
