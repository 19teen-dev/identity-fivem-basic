const path = require('path');
const dotenv = require('dotenv');

const resourcePath = GetResourcePath(GetCurrentResourceName());
dotenv.config({ path: path.join(resourcePath, '.env') });

console.log('^2[SYSTEM] .env successfully loaded!^7');
