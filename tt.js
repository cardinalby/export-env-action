const dotenv = require('dotenv');

const buf = Buffer.from('23')
const config = dotenv.parse(buf) // will return an object
console.log(typeof config, config)