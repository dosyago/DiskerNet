import os from 'os';
import path from 'path';
import fs from 'fs';

const server_port = process.env.PORT || process.argv[2] || 22120;
const mode = process.argv[3] || 'save';
const chrome_port = process.argv[4] || 9222;

const Pref = {};
export const CONFIG_DIR = path.resolve(os.homedir(), '.config', 'dosyago', 'DownloadNet');
fs.mkdirSync(CONFIG_DIR, {recursive:true});
const pref_file = path.resolve(CONFIG_DIR, 'config.json');
const cacheId = Math.random();

loadPref();

let BasePath = Pref.BasePath;
export const archive_root = () => path.resolve(BasePath, '22120-arc');
export const no_file = () => path.resolve(archive_root(), 'no.json');
export const temp_browser_cache = () => path.resolve(archive_root(), 'temp-browser-cache' + cacheId);
export const library_path = () => path.resolve(archive_root(), 'public', 'library');
export const cache_file = () => path.resolve(library_path(), 'cache.json');
export const index_file = () => path.resolve(library_path(), 'index.json');
export const fts_index_dir = () => path.resolve(library_path(), 'fts');

const flex_fts_index_dir = base => path.resolve(base || fts_index_dir(), 'flex');
const ndx_fts_index_dir = base => path.resolve(base || fts_index_dir(), 'ndx');
const fuzzy_fts_index_dir = base => path.resolve(base || fts_index_dir(), 'fuzzy');

const results_per_page = 10;

updateBasePath(process.argv[5] || Pref.BasePath || CONFIG_DIR);

const args = {
  mode,

  server_port, 
  chrome_port,

  updateBasePath,
  getBasePath,

  library_path,
  no_file,
  temp_browser_cache,
  cache_file,
  index_file,
  fts_index_dir,
  flex_fts_index_dir,
  ndx_fts_index_dir,
  fuzzy_fts_index_dir,

  results_per_page,
  CONFIG_DIR
};

export default args;

function updateBasePath(new_base_path, {force:force = false, before: before = []} = {}) {
  new_base_path = path.resolve(new_base_path);
  if ( !force && (BasePath == new_base_path) ) {
    return false;
  }

  console.log(`Updating base path from ${BasePath} to ${new_base_path}...`);
  BasePath = new_base_path;

  if ( Array.isArray(before) ) {
    for( const task of before ) {
      try { task(); } catch(e) { 
        console.error(`before updateBasePath task failed. Task: ${task}`);
      }
    }
  } else {
    throw new TypeError(`If given, argument before to updateBasePath() must be an array of functions.`);
  }

  if ( !fs.existsSync(library_path()) ) {
    console.log(`Archive directory (${library_path()}) does not exist, creating...`);
    fs.mkdirSync(library_path(), {recursive:true});
    console.log(`Created.`);
  }

  if ( !fs.existsSync(cache_file()) ) {
    console.log(`Cache file does not exist, creating...`); 
    fs.writeFileSync(cache_file(), JSON.stringify([]));
    console.log(`Created!`);
  }

  if ( !fs.existsSync(index_file()) ) {
    //console.log(`INDEXLOG: Index file does not exist, creating...`); 
    fs.writeFileSync(index_file(), JSON.stringify([]));
    console.log(`Created!`);
  }

  if ( !fs.existsSync(flex_fts_index_dir()) ) {
    console.log(`FTS Index directory does not exist, creating...`); 
    fs.mkdirSync(flex_fts_index_dir(), {recursive:true});
    console.log(`Created!`);
  }

  if ( !fs.existsSync(ndx_fts_index_dir()) ) {
    console.log(`NDX FTS Index directory does not exist, creating...`); 
    fs.mkdirSync(ndx_fts_index_dir(), {recursive:true});
    console.log(`Created!`);
  }

  if ( !fs.existsSync(fuzzy_fts_index_dir()) ) {
    console.log(`FUZZY FTS Index directory does not exist, creating...`); 
    fs.mkdirSync(fuzzy_fts_index_dir(), {recursive:true});
    fs.writeFileSync(path.resolve(fuzzy_fts_index_dir(), 'docs.fzz'), JSON.stringify([]));
    console.log('Also creating FUZZY FTS Index docs file...');
    console.log(`Created all!`);
  }



  console.log(`Base path updated to: ${BasePath}. Saving to preferences...`);
  Pref.BasePath = BasePath;
  savePref();
  console.log(`Saved!`);

  return true;
}

function getBasePath() {
  return BasePath;
}

export function loadPref() {
  if ( fs.existsSync(pref_file) ) {
    try {
      Object.assign(Pref, JSON.parse(fs.readFileSync(pref_file)));
    } catch(e) {
      console.warn("Error reading from preferences file", e);
    }
  } else {
    console.log("Preferences file does not exist. Creating one..."); 
    savePref();
  }
  return clone(Pref);
}

function savePref() {
  try {
    fs.writeFileSync(pref_file, JSON.stringify(Pref,null,2));
  } catch(e) {
    console.warn("Error writing preferences file", pref_file, Pref, e);
  }
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

