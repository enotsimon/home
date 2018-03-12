import Util from "common/util"

//
// UTILS
//
const array_stat = (array) => array.reduce((res, e) => {
  res[e] = (res[e] || 0) + 1
  return res
}, [])

const log10_arrangement_rand = () => {
  let mul = 10
  let nmin = Math.log10(mul * 0 + 1)
  let nmax = Math.log10(mul * 1 + 1)
  return 1 - (Math.log10(mul * Math.random() + 1) / (nmax - nmin) - nmin)
}
const pow_arrangement_rand = (pow = 2) => Math.pow(Math.random(), pow)

const random_length = (min, max, rand_func) => {
  let value = rand_func()
  return Math.floor(Util.normalize_value(value, 1, max + 1, 0, min))
}

const random_sequence = (alphabet, length) => {
  return [...alphabet].sort(() => Math.random() - 0.5).slice(0, length)
}

const random_sequence_of_uniq_elements = (length, element_func) => {
  return [...Array(length)].reduce(acc => {
    let gimme_element = function gimme_element(acc, element_func, i = 0) {
      let element = element_func()
      if (acc.indexOf(element) === -1) {
        return element
      } else if (i === 1000) {
        throw({msg: 'gimme_element too many recursion', acc, element})
      } else {
        return gimme_element(acc, element_func, i + 1)
      }
    }
    let element = gimme_element(acc, element_func)
    return [...acc, element]
  }, [])
}

const sequence_to_string = (sequence) => '-' + sequence.join('-') + '-'

const spell_random_length = (min, max) => random_length(min, max, log10_arrangement_rand)
const ingredient_random_length = (min, max) => random_length(min, max, log10_arrangement_rand) // ?
const foundation_random_length = (min, max) => random_length(min, max, Math.random) // ?

const elixir_new = () => ({free_symbols: [], active_symbols: []})
const elixir_add_foundation = (elixir, foundation) => ({...elixir, free_symbols: [...elixir.free_symbols, ...foundation]})
const elixir_add_ingredient = (elixir, ingredient) => {
  let e = {...elixir}
  ingredient.forEach(symbol => {
    let free_symbol_index = e.free_symbols.indexOf(symbol)
    if (free_symbol_index !== -1) {
      e.free_symbols.splice(free_symbol_index, 1)
      e.active_symbols.push(symbol)
    }
  })
  return e
}
const elixir_check_spells = (elixir, spells) => {
  let result = {substrings: [], equals: []}
  let active_symbols_str = sequence_to_string(elixir.active_symbols)
  spells.forEach(spell => {
    let spell_symbols_str = sequence_to_string(spell)
    // check for spell begin
    if (active_symbols_str === spell_symbols_str) {
      result.equals.push(spell_symbols_str)
    } else if (active_symbols_str.indexOf(spell_symbols_str) !== -1) {
      result.substrings.push(spell_symbols_str)
    }
  })
  return result
}

//
// experimantal funcs
//
const ex_max_number_of_spells = (alphabet, min_lenght, max_length) => {
  let spells = [];
  
}
const ex_add_to_spell = (spell, symbol) => {
  let copy = [...spell]
  if (copy.indexOf(symbol) === -1) {
    copy.push(symbol)
  }
  return copy;
}

const ex_all_transpositions = (alphabet, length, allow_same = true, acc = [[]]) => {
  if (length == 0) {
    return acc
  }
  let new_acc = []
  alphabet.forEach(symbol => {
    acc.forEach(sequence => {
      let new_sequence = [...sequence]
      if (allow_same || new_sequence.indexOf(symbol) === -1) {
        new_sequence.push(symbol)
        new_acc = [...new_acc, new_sequence]
      }
    })
  })
  return ex_all_transpositions(alphabet, length - 1, allow_same, new_acc)
}

// bad word for it cause it is more like 'sets'
const ex_all_combinations = (alphabet, length) => {
  let transpositions = ex_all_transpositions(alphabet, length, false)
  // TODO return not string but array-shape formulae
  let copy = transpositions.map(e => {
    e = e.sort()
    return sequence_to_string(e)
  })
  let uniq = []
  copy.forEach(e => {
    if (uniq.indexOf(e) === -1) {
      uniq = [...uniq, e]
    }
  })
  return uniq
}
// experimantal funcs


//console.log('spell_random_length stat', array_stat([...Array(1000)].map(() => spell_random_length(2, 10))))

const count_spells = 100
const count_symbols = 30 //count_spells * 1
//const count_foundations = Math.ceil(count_spells / 4)
const count_foundations = 4 * 5 // 4 -- count classes, 5 -- count in every class
const count_ingredients = count_spells * 1
const alphabet = [...Array(count_symbols)].map((val, i) => i)
const spells = random_sequence_of_uniq_elements(
  count_spells,
  () => random_sequence(alphabet, spell_random_length(2, 10))
)
const foundations = random_sequence_of_uniq_elements(
  count_foundations,
  () => random_sequence(alphabet, foundation_random_length(8, 16))
)
const ingredients = random_sequence_of_uniq_elements(
  count_ingredients,
  () => random_sequence(alphabet, ingredient_random_length(2, 10))
)

console.log('spells', spells)
console.log('foundations', foundations)
console.log('ingredients', ingredients)
/*
let substrings = []
let equals = []
let i = 0
// lets try just one variant from many
foundations.forEach(foundation => {
  ingredients.forEach(ingredient1 => {
    ingredients.forEach(ingredient2 => {
      i++
      if (i > 200000) {
        throw({msg: 'too many cycles'})
      }
      let elixir = elixir_new()
      elixir = elixir_add_foundation(elixir, foundation)
      elixir = elixir_add_ingredient(elixir, ingredient1)
      elixir = elixir_add_ingredient(elixir, ingredient2)
      let result = elixir_check_spells(elixir, spells)
      //if (result.substrings.length > 1) {
      //  console.log('result.substrings > 1', result.substrings)
      //}
      if (result.equals.length > 1) {
        console.log('result.equals > 1', result.equals)
      }
      substrings = [...substrings, ...result.substrings]
      equals = [...equals, ...result.equals]
      
      //let active_symbols_str = elixir.active_symbols.join('-')
      //if (active_symbols_str !== '') {
      //  console.log('elixir', active_symbols_str)
      //}
      
      //console.log('spells', i, foundations.length * ingredients.length);
    })
  })
})
//spells.forEach(spell => console.log('spell', spell.join('-')))
let stats = {substrings: array_stat(substrings), equals: array_stat(equals)}
console.log('substrings array_stat', stats.substrings)
console.log('equals array_stat', stats.equals)
spells.forEach(spell => {
  let key = sequence_to_string(spell)
  console.log(key, stats.substrings[key], stats.equals[key])
})
*/

let test_alphabet = ['a', 'b', 'c']
let test_seq_length = 2
console.log('ex_all_transpositions 1', ex_all_transpositions(test_alphabet, test_seq_length, true))
console.log('ex_all_transpositions 2', ex_all_transpositions(test_alphabet, test_seq_length, false))
console.log('ex_all_combinations', ex_all_combinations(test_alphabet, test_seq_length))
