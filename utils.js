const path     = require("node:path");
const fs       = require("node:fs");
const { URL } = require("node:url");
const chalk    = require("chalk");
const marked = require("marked");
const matter   = require('gray-matter');
const { INCLUDES_FOLDER, MODULES_FOLDER } = require("./constants");
const { templateRegexes } = require("./template_patterns");

// UNICODE CHARACTERS:
const checkmark = "\u2713"; // ✅ 
const xmark     = "\u274C"; // ❌

const warn = (text, hasWARNING = true)=> console.log(chalk.bold.red( hasWARNING ? "WARNING:" : ""), chalk.bold.red(text));
const ok = (text)=> console.log(chalk.bold.green(text));
const info = (text)=> console.log(chalk.bold.blue(text));

const youTubeIdRegEx = /([a-z0-9_-]{11})/i;

/**
 * @param {string}
 * @return {Array}
 * The captured groups are:
  - protocol
  - subdomain
  - domain
  - path
  - video code
  - query string
 */
const ytRegex = text => {

  const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;
  const match = text.match(regex);

  let playlist = null;
  if ( match[6] === "playlist" ){
    if (match[7].indexOf("?list=") === 0 ){
      playlist = match[7].split("?list=")[1];
    }
  }

  if ( match ){
    return {
      url: match[0],
      protocol: match[1],
      subdomain: match[2],
      domain: match[3],
      playlist: playlist ? playlist : undefined,
      path: match[5],
      vid: match[6]
    }
  }

  return null;

}
function getExtensionFromUrl( url ){

  const extension = path.extname(new URL(url).pathname).slice(1);

  return extension.toLowerCase();

}
function getFile( resource ){
  return resource.type === "file";
}
function getImageFile( resource ){

  if ( !getFile( resource ) ){
    return false;
  }

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
  const ext = getExtensionFromUrl( resource.download_url );
  
  if ( !imageExtensions.includes(ext) ) {
    return false;
  }

  return true;
}
function convertToKebabCase(inputString) {
  // Remove special characters and convert to lowercase
  const cleanedString = inputString.toLowerCase().replace(/[^\w\s-]/g, '');

  // Replace spaces with hyphens
  const kebabCaseString = cleanedString.replace(/\s+/g, '-');

  return kebabCaseString;
}
function iso8601ToSeconds(duration) {
  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  match = match.slice(1).map(function(x) {
    if (x != null) {
        return x.replace(/\D/, '');
    }
  });

  var hours = (parseInt(match[0]) || 0);
  var minutes = (parseInt(match[1]) || 0);
  var seconds = (parseInt(match[2]) || 0);

  return hours * 3600 + minutes * 60 + seconds;
}
function formatDate(iso8601String) {
  const parsedDate = new Date(iso8601String);
  const day = parsedDate.getUTCDate().toString().padStart(2, "0");
  const month = (parsedDate.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = parsedDate.getUTCFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}
/**
 * Description: accepts a markdown text as input and returns an array of **bold text** sections found in the file
 * @param {string} fileContent 
 * @returns {Array}
 */
function findBoldTextMatches( fileContent ){

  const regex = /\*\*(.*?)\*\*/g;
  const boldTextMatches = fileContent.match( regex );
  return boldTextMatches

}
/**
 * Description: accepts a markdown text as input and returns an array of **YouTube URLs** found in the file
 * @param {string} fileContent 
 * @returns {Array}
 */
function decodeYouTubeURL( fileContent ){

  // Regular Expression Source: https://stackoverflow.com/a/37704433/4861760
  const ytRegexNoCapture = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)([^\s)]+)?/g;

  const ytLinks = fileContent.match( ytRegexNoCapture );
  return ytLinks ?? [];

}
function findMarkdownLinks( fileContent ){

  throw new Error("Not implemented yet");
  // const regex = /\*\*(.*?)\*\*/g;
  // const boldTextMatches = fileContent.match( regex );
  // return boldTextMatches
  return fileContent;

}
function getYouTubeListIdParts( ytURL ){

  const playListQueryString = ytURL.match(/[&?]list=([^&]+)/i);

  if ( playListQueryString ){
    const [ firstPart, secondPart ] = ytURL.split(playListQueryString[0]);
    const output = [ firstPart, playListQueryString[0] ]
    if ( secondPart.trim().length > 0 ){
      output.push( secondPart );
    }
    return output;
  }

  return [];
}
function getResourcesContent(){

  const resourcesDir = path.join( __dirname, "..", "..", "resources/" );
  const resourcesPath = path.join( resourcesDir, "resources.json");
  const resourcesText = fs.readFileSync(resourcesPath, "utf8");
  return resourcesText;

}
/**
 * Description: read resource.json and return the contents in JSON format
 */
function getResources(){

  const resourcesText = getResourcesContent()
  const { resources } = JSON.parse(resourcesText)
  return resources;

}
function appendObjectToResources( obj ){

  const resourcesDir = path.join( __dirname, "..", "..", "resources/" );
  const resourcesPath = path.join( resourcesDir, "resources.json");
  const resourcesText = getResourcesContent()
  const json = JSON.parse(resourcesText)
  const key = Object.keys(obj)[0];
  json.resources[key] = obj[key];
  try {
    fs.writeFileSync(resourcesPath, JSON.stringify(json, null, "  "), "utf-8");
  } catch(e){
    console.log(e);
  }
  return json;

}
function getYouTubeResources(){

  const resources = getResources();
  const youTubeResources = Object
  .entries(resources)
  .filter(([slug, value])=>{
    return value.type === "YouTube";
  });
  return youTubeResources;
}
function createFrontMatterMarkdownFromObject( fmObj ){

  let fmText = "";
  
  const fmObjEntries = Object.entries(fmObj);

  if (fmObjEntries.length > 0) {

    fmText = [
      "---",
      ...fmObjEntries.map(([key, value]) => {
        return `${key}: ${value}`
      }),
      "---"
    ].join("\n") + "\n";

  }

  return fmText;

}
// Thanks ChatGPT!
function rmSyncExclude(dir, excludeItems) {
  fs.readdirSync(dir).forEach((item) => {
    const itemPath = path.join(dir, item);

    if (excludeItems.includes(item)) {
      // Skip excluded items
      return;
    }

    if (fs.statSync(itemPath).isDirectory()) {
      // Recursively remove files and subdirectories
      rmSyncExclude(itemPath, excludeItems);
    } else {
      // Remove files
      fs.rmSync(itemPath);
    }
  });

}

// APPEND FRONTMATTER TO THE OUTPUT FILE:
function getFrontMatterStringFromObject(fm, liveCodeEnabled=false) {

  const fmEntries = Object.entries(fm);
  let fmString = "";
  if (fmEntries.length !== 0) {
    fmString += "---\n";
    fmEntries.forEach(line => {
      fmString += `${line[0]}: ${line[1]}\n`
    });
    if ( liveCodeEnabled ) {
      // Include the following content to enable live coding 
      fmString += "load_script_js_via_src:\n  - flems/flems.html\n  - flems/flems_init.js\n";
    }
    fmString += "---\n";
  }
  return fmString;

}

// PRINT COLORED CSV
function printColoredCSV( csv, SEPARATOR = "," ){
  const colors = [ "white", "magenta", "green", "yellow", "blue", "magentaBright", "red", "cyan" ];
  console.log();
  csv.split("\n").forEach( line =>{
    let str = [];
    line.split(SEPARATOR).forEach((col,index) =>{
      str.push(`${chalk[colors[index]](col)}`);
    });

    console.log(str.join(","));
  }) 
}

function getInclude({ file, day, numOfWeek }){

  const {

    weekRegex,
    weekFullRegex,
    dayRegex

  } = templateRegexes;

  const includeFile = path.join( INCLUDES_FOLDER, file.trim() + ".md" );

  try {

    const contents = fs.readFileSync(includeFile, "utf-8");
    return contents
    .replace(weekRegex,String(numOfWeek).padStart(2,"0"))
    .replace(weekFullRegex, `Week ${numOfWeek}`)
    .replace(dayRegex, String(day).padStart(2,"0"));

  } catch(e) {

    console.log(e);
    return `<!-- Missing include file: ${file.trim()}.md -->`

  }

}

function replaceInclude({ day, numOfWeek, conditionals } = {}){

  const paddedDay = String(day).padStart(2,"0");
  const paddedNumOfWeek = String(numOfWeek).padStart(2,"0");

  return function( match, group1, string){

    // If we have a special conditional callback, run the checks
    // to see whether we can skip some sections:
    if ( conditionals && conditionals[group1] ){

      const skip = conditionals[group1]({ 
        match,
        group1,
        string,
        day,
        numOfWeek 
      });

      if ( skip ){
        return "";
      }

    }

    return getInclude({ 
      file: group1, 
      day: paddedDay, 
      numOfWeek: paddedNumOfWeek 
    });

  }
}

// REPLACES: {{ WDX:MODULE:path/index.md }} WITH: contents of index.md
function replaceModule( match, lineSpaces, modulePath, offset, string ){

  // console.log({ match, lineSpaces, modulePath, offset });
  const fullPath = path.join(MODULES_FOLDER, modulePath.trim());
  const textContent = fs.readFileSync(fullPath, "utf-8");
  const { content, data: fm, orig } = matter(textContent);

  // Making sure to respect the indentation of the initial Module:
  if ( lineSpaces.length > 0 ){
    // console.log("Appending extra space:");
    const extraSpace = Array.from({ length: lineSpaces.length }, x => " " ).join("");
    return content.split("\n")
    .map( line => extraSpace + line )
    .join("\n");
  }
  return content;

}

/** function replaceModuleRead( replaceArgs ) returns string
 * REPLACES: 
 *  {{ SGEN:MODULE_READ:path/to/index.md }} 
 * WITH:
 *  - [Read: **frontMatter.title**](../modules/path/to/index.md){:target="_blank"}
 * */ 
function replaceModuleRead( match, lineSpaces, modulePath, offset, string) {

  // console.log({ match, lineSpaces, modulePath, offset });
  const fullPath = path.join(MODULES_FOLDER, modulePath.trim());
  const textContent = fs.readFileSync(fullPath, "utf-8");
  const { content, data: fm, orig } = matter(textContent);
  
  return `  - [Read: **${fm.title}**](../modules/${modulePath.trim()}){:target="_blank"}`;

}

// Deep Markdown Token parsing for Assets (./assets/*)
function parseTokenForAssetAndPushToArray( token, hrefs ){
  
  if ( token.type === "link" ){
    if ( token.href.indexOf("./assets") === 0 ){
      hrefs.push(token.href);
    }
  }
  if ( token.tokens ){
    token.tokens.forEach( t => parseTokenForAssetAndPushToArray( t, hrefs ));
  }
  if ( token.items ){
    token.items.forEach( t => parseTokenForAssetAndPushToArray( t, hrefs ));
  }

}

// Input: Token => Output: Array(hrefs)
function parseTokenForMediaAssets( token ){

  const hrefs = [];

  // TODO: Probably this function can replace the following 2 if statements altogether as it parses all the MD Tree for links with ./assets
  parseTokenForAssetAndPushToArray( token, hrefs );

  if ( token.type === "paragraph" ){

    token.tokens.forEach( t =>{

      const isImage        = t.type === "image";
      const isInAssets     = t.href && ( t.href.indexOf("./assets") === 0 );
      const isLink         = t.type === "link";
      const hasImageToken  = t.tokens && Array.isArray(t.tokens) && ( t.tokens.length === 1) && ( t.tokens[0].type === "image" );

      if ( isImage && isInAssets ){
        hrefs.push(t.href);
      }

      if ( isLink && hasImageToken ){
        hrefs.push(t.tokens[0].href);
      }

    });

  }

  return hrefs;

}


/**
 * function parseTokenForLiveCoding
 * parses token for [&#9658; Live coding](#flems-enable) used with flems
 * 
 * @params token: string
 * @return True if link found, False otherwise
 */
function parseTokenForLiveCoding( token ) {

  // TODO: Maybe need to go deeper than one level
  // TODO: Add toggle on/off functionality
  if ( token.type === "paragraph" && token.tokens.some(t => t.type === "link" && t.href === "#flems-enable") ) {
    return true;
  }

  return false;

}

// Search for WDX:META patterns:
function parseWdxMetaProgress({ token }){

  const metaProgressRegex = templateRegexes.meta.progress;
  const entryDefault = {
    task: null,
    instructions: "Update FALSE to TRUE in the COMPLETED column",
    level: "Beginner"
  }
  const output = { hasMeta: null, meta: null, raw: null }
  const hasWdxMeta = token.raw.match(metaProgressRegex); 
  if ( hasWdxMeta ){

    output.hasMeta = true;
    const raw = token.raw.replace(metaProgressRegex, "");
    const params = hasWdxMeta.groups.params.split("|");
    const entry = {}
    params.forEach( param =>{
      const [ key, value ] = param.split("=");
      entry[key] = value;
    })
    output.meta = { ...entryDefault, ...entry, raw }

  }
  return output

}

// Search for WDX:META:TESTS
function parseWdxMetaTests({ token }){

  const metaTestsRegex = templateRegexes.meta.tests;
  const output = { hasMeta: null, meta: null, raw: null };
  const hasWdxMetaTests = token.raw.match(metaTestsRegex);

  if ( hasWdxMetaTests ) {
    
    output.hasMeta = true;
    const raw = token.raw.replace(metaTestsRegex, "");
    const params = hasWdxMetaTests.groups.params.split("|");
    const entry = {};
    params.forEach( param =>{
      const [ key, value ] = param.split("=");
      if ( key === 'files' ) {

        entry[key] = value.split(",");

      } else {

        entry[key] = value;

      }
    })
    output.meta = { ...entry, raw };

  }
  return output;

}

/**
 * Search token for a link to module and parses said module for any {{ SGEN }} tags.
 * Current tags supported: SGEN:META:PROGRESS, SGEN:META:TESTS
 * @param {string} token token
 * @returns { {progressEntries, testEntries} } object with arrays of entries for supported tags. null if error
 */
function parseTagsFromLinkToModule(token){

  const progressEntries = [];
  const testEntries = [];

  // regex to find the relative path of our modules, which is in a string like this: '(../modules<PATH>)'
  const regex = /\]\((\.\.\/modules\/([^\)]+))/g;
  let match;
  while ((match = regex.exec(token.raw)) !== null) {
    
    // match[2] contains the content captured by the second capturing group (([^\)]+)), which is the specific part of the path we want.
    const modulePath = path.join(MODULES_FOLDER, match[2]);
    
    try {
      
      // Read each module linked, and parse it for supported {{ SGEN }}
      const moduleMarkdown = fs.readFileSync(modulePath, "utf-8");
      
      const { content, data: fm, orig } = matter(moduleMarkdown);
      const moduleMarkdownTokens = marked.lexer(content);
      
      moduleMarkdownTokens.forEach(token => {
        const wdxMetaProgress = parseWdxMetaProgress({ token });
        const wdxMetaTests = parseWdxMetaTests({ token });
        
        if (wdxMetaProgress.hasMeta) {
          progressEntries.push({
            ...wdxMetaProgress.meta
          });
        } else if (wdxMetaTests.hasMeta) {
          testEntries.push({
            ...wdxMetaTests.meta
          });
        }
      });
      
    } catch (e) {
      console.log(e);
      return null;
    }

  }

  return {
    progressEntries,
    testEntries
  }
}

function createExerciseFolders({ weeklyData, title, numOfWeek }){

  weeklyData.forEach((dailyData, idx) =>{

    const paddedDay = String(idx+1).padStart(2,"0");
    const weeklyUserFolder = path.join(
      "user",
      `week${numOfWeek}`,
      "exercises",
      `day${paddedDay}`
    );

    const doesWeeklyUserFolderExist = fs.existsSync(weeklyUserFolder);

    // Because 'user/weekXX/' folder is re-created at the beginning of SGEN, the check below will always be true.
    // Leaving it for safety.
    if ( !doesWeeklyUserFolderExist ) {
      fs.mkdirSync(weeklyUserFolder, { recursive: true });
      console.log(`Folder '${weeklyUserFolder}' created.`);
    }
    fs.writeFileSync(
      path.join(weeklyUserFolder, ".gitkeep"), 
      "", "utf-8"
    );


  })
}

module.exports = {
  templateRegexes,
  getFrontMatterStringFromObject,
  getInclude,
  replaceInclude,
  parseTokenForLiveCoding,
  parseTokenForMediaAssets,
  parseWdxMetaProgress,
  parseWdxMetaTests,
  parseTagsFromLinkToModule,
  createExerciseFolders,
  replaceModule,
  replaceModuleRead,
  appendObjectToResources,
  checkmark,
  xmark,
  youTubeIdRegEx,
  ytRegex,
  getFile,
  getResources,
  getYouTubeResources,
  getYouTubeListIdParts,
  decodeYouTubeURL,
  getImageFile,
  getExtensionFromUrl,
  convertToKebabCase,
  formatDate,
  iso8601ToSeconds,
  findBoldTextMatches,
  warn,
  info,
  ok,
  createFrontMatterMarkdownFromObject,
  rmSyncExclude
}