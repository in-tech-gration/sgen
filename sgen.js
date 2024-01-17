#!/usr/bin/env node

// DESCRIPTION: Script to dynamically generate Syllabus and related content in Markdown format
// USAGE: WDX-180/> node tools/sgen.js curriculum/curriculum.yaml
/**
 * REPLACES: {{ WDX:Syllabus }} => curriculum.yaml
 * REPLACES: {{ WDX:WEEK }}     => weekly.yaml
 */

// 0) IMPORTS: =================================================================
const path = require("node:path");
const fs   = require("node:fs");
const matter = require('gray-matter');
const yaml = require('yaml');
const { Command } = require('commander');

const {
  warn, 
  templateRegexes,
  replaceModule,
  getFrontMatterStringFromObject,
} = require("./utils");

const { createWeeklyContentFromYaml } = require("./weekly");
const { createSyllabusFromMarkdownText } = require("./syllabus");
const { argv } = require("node:process");
const { SCHEDULE_FOLDER } = require("./constants");

// TODO:
// 1) Warn about #### inside the ### Module sections. Use **Bold** instead.
// 2) Add a `--no-user` flag to run the sgen tool without creating the user/ folder and subsequent subfolders


// 1) OUR FUNCTIONS: ===========================================================

// TODO: WiP
function getModule({}){

}

// TODO: WiP
function createContentFromYaml({ configYaml, filename }) {

  const { input, output, daily_input, schedule, title } = yaml.parse(configYaml);
  const textContent        = fs.readFileSync(input, "utf-8");

  // Parse markdown and separate Frontmatter and main content:
  const { content, data: fm, orig } = matter(textContent);

  try {

    const {

      // weekRegex,
      titleRegex,
      moduleRegex,
      // dateUpdatedRegex,
      // weeklyContentRegex,
      // includesRegex
  
    } = templateRegexes;
  
    // const date = new Date();
    // const DDMMYYYY = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}` 
  
    let newRaw = textContent
    .replace(titleRegex, title)
    
    // .replace(dateUpdatedRegex, DDMMYYYY)
    // .replace(includesRegex, replaceInclude());
    .replace(moduleRegex, replaceModule);
  
    
  // const dailyMarkdownTokens = marked.lexer(dailyDraftTemplate);
  fs.writeFileSync(output, newRaw, "utf-8");

  //   const daysEntries = Object.entries(schedule.days);
  //   const weeklyData = daysEntries
  //   .map( entry =>{
  //     return parseDailyContent({ entry, dailyMarkdownTokens, numOfWeek });
  //   });
    
  //   let weeklyContent = weeklyData
  //   .filter(Boolean)
  //   .map( data => data.content )
  //   .join("");
  //   // Parse markdown tokens:
  //   const markdownTokens = marked.lexer(content);
  //   let outputContent = "";
  //   markdownTokens.forEach( token =>{

  //     if ( token.raw ){

  //       const parsedTokenRaw = parseWeeklyPatterns({ 
  //         raw: token.raw, 
  //         numOfWeek,
  //         weeklyContent,
  //         title
  //       }); 

  //       outputContent += parsedTokenRaw;

  //     } else {

  //       outputContent += token.raw;

  //     }
  //   });
  
  //   const fmString = getFrontMatterStringFromObject(fm);
  
  //   outputContent = parseWeeklyPatterns({ raw: fmString, numOfWeek, title }) + outputContent;
  
  //   const weeklyIndexMarkdown = path.join( weeklyFolder, "index.md" );
  //   fs.writeFileSync(weeklyIndexMarkdown, outputContent, "utf-8");

  //   // Copy Media Assets from Module folder to curriculum/
  //   copyWeeklyMediaAssets({ weeklyData, title });

  //   // Generate /user/weekXX/exercises/... folders
  //   createExerciseFolders({
  //     weeklyData, title, numOfWeek
  //   }); 

  //   // Generate progress sheets:
  //   const csv = generateWeeklyProgressSheetFromWeeklyData({ 
  //     weeklyData, title 
  //   });

  //   // Generate yaml tests:
  //   const test = generateWeeklyTestsFromWeeklyData({
  //     weeklyData, title
  //   });

  } catch(e) {

    console.log(e);

  }

}

function init() {

  let configYamlPath;
  global.sgenConfig = {
    debug: false,
    scheduleFolder: SCHEDULE_FOLDER
  }

  const packageJSON = require("./package.json");
  const program = new Command();

  // Declare command line options
  program
    .name('sgen')
    .usage('-V/--version | -p/--patterns | -d/--debug <configYamlPath> | <configYamlPath>')
    .version(`v${packageJSON.version}`)
    .option('-d, --debug', 'output extra debugging.')
    .option('-s, --schedule <folder>', 'specifies the schedule folder.')
    .option('-p, --patterns', 'display available SGEN patterns.');

  program.parse();
  const options = program.opts();
  
  if (options.debug) global.sgenConfig.debug = true;

  if (options.schedule) {
    global.sgenConfig.scheduleFolder = options.schedule;
  }
  
  if (options.patterns) {
    const regexEntries = Object.entries(templateRegexes);
    console.log(`Available patterns:`);
    console.log(`===================`);
    regexEntries.forEach(([key,value])=>{
      if ( key.endsWith("Doc" ) ){
        console.log( value );
      }
    })
    process.exit();
  }

  // After parsing, remaining arguments will be stored at program.args array.
  const argument = program.args[0];

  if (!argument) {
    warn("Missing configYamlPath. Re-run with -h/--help for more options.");
    process.exit();
  }

  configYamlPath = argument;
  const weekNum = parseInt(argument, 10);
  if ( typeof weekNum === "number" && !Number.isNaN(weekNum) ){
    const scheduleWeekFolderExists = fs.existsSync(path.join(global.sgenConfig.scheduleFolder, `week${String(weekNum).padStart(2,"0")}`));
    
    if (scheduleWeekFolderExists) { // Expects to find the weekXX.yaml file inside <SCHEDULE_FOLDER>/weekXX/ folder
      configYamlPath = path.join(
        "curriculum",
        "schedule",
        `week${String(weekNum).padStart(2,"0")}`,
        `week${String(weekNum).padStart(2,"0")}.yaml`
      );
    } else { // LEGACY: Expects to find the weekXX.yaml file inside curriculum/schedule/ folder
      configYamlPath = path.join(
        "curriculum", 
        "schedule", 
        `week${String(weekNum).padStart(2,"0")}.yaml`
      );
    }
  }

  const configYaml = fs.readFileSync(configYamlPath, "utf-8");
  const { input, output, Syllabus } = yaml.parse(configYaml);

  try {

    // e.g. curriculum/curriculum.yaml
    if ( Syllabus ) {  
      
      const textContent = fs.readFileSync(input, "utf-8");
      console.log(`Processing Syllabus: ${input}`);
      const outputContent = createSyllabusFromMarkdownText({ textContent, configYaml });
      return fs.writeFileSync(output, outputContent, "utf-8");
      // TODO: (Optionally) read all weeks (e.g. week01.yaml, week02.yaml, etc.) and generate all the content along with the curriculum/index.md

    }  

    const filename = path.basename(configYamlPath, path.extname(configYamlPath));

    // e.g. curriculum/schedule/week04.yaml
    if ( filename.indexOf("week") === 0 ){

      console.log(`Processing Weekly Content: ${configYamlPath}`);
      return createWeeklyContentFromYaml({ configYaml, filename });

    }

    // All the rest...
    createContentFromYaml({ configYaml, filename });

  } catch (e) {

    console.log(e);

  }

}

// 2) OUR VARIABLES: ===========================================================

// 3) ACTION!!! ================================================================

if (require.main === module) {
  // console.log("This script was executed directly.");
  init();
} else {
  // console.log("This script was imported as a module.");
  init();
}

// 4) EXPORT SECTION: ==========================================================

module.exports = {
  templateRegexes, // This export is for testing purposes.
  getFrontMatterStringFromObject,
  createSyllabusFromMarkdownText
}