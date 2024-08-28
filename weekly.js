const yaml = require('yaml');
const fs   = require("node:fs");
const path = require("node:path");
const { parse, stringify } = require("csv/sync");
const marked = require("marked");
const matter = require('gray-matter');
// TODO: Why do we have 2 utils? utils.js and utils/index.js?
const { 
  templateRegexes,
  replaceInclude,
  replaceModule,
  createExerciseFolders,
  getFrontMatterStringFromObject
} = require("./utils");
const {
  warn,
  ok,
  info,
  xmark,
  checkmark,
  rmSyncExclude
} = require("./utils/");
const {
  parseDailyContent,
  copyDailyExercises,
  copyDailyMediaAssets
} = require("./daily");

// CONDITIONALS: IF "weekly_suggestions"
function weeklySuggestionsGuard({ match, group1, string, day,numOfWeek }){

  let skipThisSection = false;

  try {

    console.log({ match, group1, string, day, numOfWeek });
    const weekendMarkdown = path.join( 
      "curriculum", `week${numOfWeek}`, "WEEKEND.md"
      );
    const weekendMarkdownExists = fs.existsSync(weekendMarkdown);
    if ( !weekendMarkdownExists ) {
      skipThisSection = true; // Will skip this section
    }

  } catch(e){

    console.log(e);

  }

  return skipThisSection; 

}

// Mini-parsers: (to be moved elsewhere and unit-tested)
function parseWeeklyPatterns({ raw, numOfWeek, weeklyContent, title }){

  const {

    weekRegex,
    weekNumRegex,
    titleRegex,
    dateUpdatedRegex,
    weeklyContentRegex,
    includesRegex,
    moduleRegex

  } = templateRegexes;

  const date = new Date();
  const DDMMYYYY = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}` 

  let newRaw = raw
  .replace(weekNumRegex, `${String(numOfWeek).padStart(2,"0")}`)
  .replace(weekRegex, `Week ${numOfWeek}`)
  .replace(titleRegex, title)
  .replace(dateUpdatedRegex, DDMMYYYY)
  .replace(weeklyContentRegex, weeklyContent)
  .replace(
    includesRegex, 
    replaceInclude({ 
      numOfWeek, 
      conditionals: {
        // IF PATTERN       : CALLBACK
        "weekly_suggestions": weeklySuggestionsGuard
      } 
  }))
  .replace(moduleRegex, replaceModule );

  return newRaw;
}

// TODO: Simplify this, so that sgen just copies the whole assets/ folder!
function copyWeeklyMediaAssets({ weeklyData, title }){

  weeklyData.forEach( dailyData =>{

    if ( !dailyData ){
      return false;
    }

    const mediaEntries = dailyData.media;

    if ( mediaEntries ){

      for ( const entry of mediaEntries.entries ){
        const mediaPath = path.join( mediaEntries.dailyModuleDir, entry );
        const targetPath = path.join( "curriculum", `week${mediaEntries.week}` );
        const targetAssetsPath = path.join( targetPath, "assets" );
        const targetFile = path.join( targetPath, entry );

        try {

          const userFolderExists = fs.existsSync(targetAssetsPath);
      
          if ( userFolderExists ) {
        
            warn(`Folder '${targetPath}' already exists.`);
            
          } else {
            
            fs.mkdirSync(targetAssetsPath, { recursive: true });
            console.log(`Folder '${targetPath}' created.`);
            
          }

          fs.copyFile(mediaPath, targetFile, (err) => {
            if (err) {
              if ( err.code && err.code === "ENOENT" ){
                warn(`${xmark} Error copying ${err.path} => ${err.dest}`);
                console.log(`${xmark}: ${mediaPath} => ${targetFile}`);                
              }
            };
            ok(`${checkmark} MEDIA COPIED: ${mediaPath} => ${targetFile}`);
          });

        } catch (e){

          console.log(e);
          
        }

      }

      return;

    }

  });

}

// Generate progress.draft.*.csv files from weekly content object
function generateWeeklyProgressSheetFromWeeklyData({ weeklyData, title }){

  const csvHeaders = `Week,Day,Concept,Task,Level,Confidence,Completed,Instructions`;
  let csv = csvHeaders;
  
    weeklyData.forEach( dailyData =>{

    let dailyCSV = csvHeaders;

    if ( !dailyData || !dailyData.progress ){
      return false;
    }

    const progressEntries = dailyData.progress.entries;
    const { week, day }  = dailyData.progress;
    const upPaddedWeek   = week.indexOf("0") === 0 ? week.slice(1) : week;
    const paddedDay      = String(day).padStart(2,"0");

    if ( progressEntries.length ){

      progressEntries.forEach( entry =>{

        const { instructions: _instructions, task, level, user_folder, extras } = entry;
        let instructions = "Update FALSE to TRUE in the COMPLETED column";
        const userFolder = user_folder ? `user/week${week}/exercises/day${paddedDay}/${user_folder}/` : null;

        switch (_instructions) {
          case "UPLOAD_ASSETS":
            if ( userFolder ){
              instructions = `Upload the required assets to the ${userFolder} folder`;
            } else {
              instructions = "Upload the required assets to the corresponding user/ folder";
            }
            break;
          case "CHECK_COMPLETED":
          default:
            if ( userFolder ){
              instructions = `Upload the required assets to the ${userFolder} folder`;
            } 
            break;
        }

        const weeklyTitle = title;
        const dailyTitle  = dailyData.title;

        dailyCSV += `\n${upPaddedWeek},${day},${weeklyTitle}: ${dailyTitle},${extras ? "EXTRAS: " + task : task},${level},0-10,FALSE,${instructions}`;

      })

    }

    csv += dailyCSV;

    try {
      
      const userProgressFolder       = path.join("user", `week${week}`, "progress");
      const userProgressFolderExists = fs.existsSync(userProgressFolder)
      
      if ( !userProgressFolderExists ) {
        
        fs.mkdirSync(userProgressFolder, { recursive: true });
        info(`Folder '${userProgressFolder}' created.`);
        
      }
      
      parse(dailyCSV);
      ok(`${checkmark} CSV Linting looks good!`);

      const progressFilename = `progress.draft.w${week}.d${paddedDay}.csv`;

      // printColoredCSV(dailyCSV);
      if ( dailyCSV === csvHeaders || dailyCSV.length === 0 ){
        return;
      }

      console.log("Writing to file " + progressFilename + ":");

      fs.writeFileSync(
        path.join( userProgressFolder, progressFilename ),
        dailyCSV, "utf-8"
      );
      
    } catch(e){

      console.log("Error parsing generated progress CSV",e);
    }

  });

  return csv;
}

function generateWeeklyTestsFromWeeklyData({ weeklyData, title }){

  weeklyData.forEach(dailyData =>{
  
    if ( !dailyData || !dailyData.tests ){
      return false;
    }

    const { week, day } = dailyData.tests;
    const testEntries = dailyData.tests.entries;
    const upPaddedWeek   = week.indexOf("0") === 0 ? week.slice(1) : week;
    const paddedDay      = String(day).padStart(2,"0");

    if ( testEntries.length ){

      console.log(`Creating tests for exercises of Week ${week} Day ${paddedDay}.`);

      testEntries.forEach( entry =>{

        const finalFolder = `user/week${week}/exercises/day${paddedDay}/${entry.user_folder}/`;

        const testName = `Week ${week} - Day ${day} ${title} | ${entry.name}`;
        const triggerOn = `on:\n  push:\n    branches:\n      - 'main'\n    paths:\n      - ${finalFolder}**`;
        const jobs = `jobs:\n  ${entry.user_folder}:\n\n    runs-on: ubuntu-latest\n\n    `;
        let steps = 'steps:\n      - name: Checkout code\n        uses: actions/checkout@v3\n';
        if (entry.type === 'exist') {
          steps += `\n      - name: "${entry.name} > Check solution files existence"\n        uses: andstor/file-existence-action@v2\n        with:\n          files: "${entry.files.map(file => `${finalFolder}${file}`).join(", ")}"\n          fail: true`;
        } else if (entry.type === 'js') {
          // TODO: Add configuration for JS tests (maybe will need more parameters on the WDX:META:TESTS comment) plus some existence checks
          steps += ``;
        }
        const yamlContent = `name: "${testName}"\n${triggerOn}\n${jobs}${steps}`;

        const workflowsFolder = path.join(".github", "workflows");
        const workflowsFolderExists = fs.existsSync(workflowsFolder);

        try {

          yaml.parse(yamlContent);
          
          if ( workflowsFolderExists ) {

            warn(`Folder ${workflowsFolder} already exists.`);
  
          } else {
  
            fs.mkdirSync(workflowsFolder, { recursive: true });
            info(`Folder ${workflowsFolder} created.`);
  
          }
  
          const testFilename = `w${week}-d${paddedDay}-${entry.user_folder}.yaml`;
          info(`Writing to file ${testFilename}:`);
          fs.writeFileSync(
            path.join(workflowsFolder, testFilename),
            yamlContent, "utf-8"
          );

        } catch (e) {

          console.log(`Error while writing YAML test file for exercise ${entry.name}: ${e}`);
          
        }

      } );
    }
  })

}

function createWeeklyContentFromYaml({ configYaml, filename }) {

  const { 
    input: markdownDraftTemplate,
    daily_input,
    schedule,
    title 
  } = yaml.parse(configYaml);
  const weeklyFolder           = path.join("curriculum", filename);
  const weeklyFolderExists     = fs.existsSync(weeklyFolder);
  const weeklyUserFolder       = path.join("user", filename);;
  const weeklyUserFolderExists = fs.existsSync(weeklyUserFolder);
  const isDryRunMode           = global.sgenConfig.dryRun;

  if ( weeklyFolderExists ) {

    warn(`Folder '${weeklyFolder}' already exists. (Selectively) deleting it to begin from scratch.`);
    
    if ( isDryRunMode ){
      console.log(`[DRY-RUN MODE] Deleting the contents of folder '${weeklyFolder}' excluding the following: WEEKEND.md`);
    } else {
      // fs.rmSync(weeklyFolder, { recursive: true });
      rmSyncExclude(weeklyFolder, ["WEEKEND.md"]); // Selective rm excluding files/folders inside the 2nd argument
    }
    
  } else {

    if ( isDryRunMode ){
      console.log(`[DRY-RUN MODE] Folder '${weeklyFolder}' created.`);
    } else {
      fs.mkdirSync(weeklyFolder);
      info(`Folder '${weeklyFolder}' created.`);
    }
  
  }
  
  if ( weeklyUserFolderExists ) {
    
    warn(`User Folder '${weeklyUserFolder}' already exists. Deleting it to begin from scratch.`);

    if ( isDryRunMode ){
      console.log(`[DRY-RUN MODE] Recursively deleting user folder '${weeklyUserFolder}'.`);
    } else {
      fs.rmSync(weeklyUserFolder, { recursive: true });
    }

  } 

  if ( isDryRunMode ){
    console.log(`[DRY-RUN MODE] Creating user folder '${weeklyUserFolder}' from scratch.`);
  } else {
    fs.mkdirSync(weeklyUserFolder);
    info(`User Folder '${weeklyUserFolder}' created.`);
  }

  const textContent = fs.readFileSync( markdownDraftTemplate, "utf-8");

  // Parse markdown and separate Frontmatter and main content:
  const { content, data: fm, orig } = matter(textContent);

  const numOfWeek = filename.split("week")[1]; // 04

  try {

    const dailyDraftTemplate = fs.readFileSync(daily_input, "utf-8");
    const dailyMarkdownTokens = marked.lexer(dailyDraftTemplate);

    const daysEntries = Object.entries(schedule.days);
    const weeklyData = daysEntries
    .map( entry =>{
      return parseDailyContent({ entry, dailyMarkdownTokens, numOfWeek });
    });
    
    let weeklyContent = weeklyData
    .filter(Boolean)
    .map( data => data.content )
    .join("");
    // Parse markdown tokens:
    const markdownTokens = marked.lexer(content);
    let outputContent = "";
    markdownTokens.forEach( token =>{

      if ( token.raw ){

        const parsedTokenRaw = parseWeeklyPatterns({ 
          raw: token.raw, 
          numOfWeek,
          weeklyContent,
          title
        }); 

        outputContent += parsedTokenRaw;

      } else {

        outputContent += token.raw;

      }
    });
  
    const fmString = getFrontMatterStringFromObject(fm, weeklyData.some(wd => wd.liveCodeEnabled));
  
    outputContent = parseWeeklyPatterns({ raw: fmString, numOfWeek, title }) + outputContent;
  
    const weeklyIndexMarkdown = path.join( weeklyFolder, "index.md" );
    if ( !fs.existsSync(weeklyIndexMarkdown) ) {
      console.log("Could not find:", weeklyIndexMarkdown);
    }
    fs.writeFileSync(weeklyIndexMarkdown, outputContent, "utf-8");
    
    // Copy Media Assets from Module folder to curriculum/ 
    daysEntries.forEach( dailyEntry =>{
      
      const dailyModuleFolder = dailyEntry[1].module;
      copyDailyMediaAssets({ weeklyFolder, dailyModuleFolder });
      copyDailyExercises({ weeklyFolder, dailyModuleFolder });
      
    });
    // [DEPRECATED] IN FAVOR OF copyDailyMediaAssets()
    // copyWeeklyMediaAssets({ weeklyData, title });

    // Generate /user/weekXX/exercises/... folders
    createExerciseFolders({
      weeklyData, title, numOfWeek
    }); 

    // Generate progress sheets:
    const csv = generateWeeklyProgressSheetFromWeeklyData({ 
      weeklyData, title 
    });

    // Generate yaml tests:
    const test = generateWeeklyTestsFromWeeklyData({
      weeklyData, title
    });

  } catch(e) {

    console.log(e);

  }

}

module.exports = {
  parseWeeklyPatterns,
  copyWeeklyMediaAssets,
  createWeeklyContentFromYaml,
  generateWeeklyTestsFromWeeklyData,
  generateWeeklyProgressSheetFromWeeklyData
}