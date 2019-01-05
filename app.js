const fs = require("fs");
const inquirer = require("inquirer");

run();

async function run() {
	let metadataFilePath = filePath();
	if (!metadataFilePath) return;
		
	let metadata = readFile(metadataFilePath);
	if (!metadata) return;

	let stats = localeStats(metadata);
	let chosenLocale = await promptLocales(metadata, stats);
	
	let swappedMetadata = swapTranslations(metadata, chosenLocale.currentLocale, chosenLocale.newLocale);
	saveFile(swappedMetadata, saveFilePath(metadataFilePath));
}

/** CLI */
async function promptLocales(metadata, stats) {
	var prompt = [
		{
			type: "list",
			name: "currentLocale",
			message: "Current main locale",
			choices: allLocaleOptions(),
			default: "en: English"
		},
		{
			type: "list",
			name: "newLocale",
			message: "Locale to set as main locale",
			choices: availableLocaleOptions(stats)
		}
	];
	let {currentLocale, newLocale} = await inquirer.prompt(prompt);
	return {
		"currentLocale": currentLocale.split(":")[0],
		"newLocale": newLocale.split(":")[0]
	}
}

/** METADATA OPERATIONS */
function swapTranslations(metadata, currentLocale, newLocale) {
	let property = {};
	for (let type in metadata) {
		for (let obj of metadata[type]) {
			if (obj.hasOwnProperty("translations")) {
				let newTranslations = [];
				for (let translation of obj.translations) {
					if (translation.locale == newLocale && obj.hasOwnProperty(propLookup(translation.property))) {
						let currentValue = obj[propLookup(translation.property)];
						let newValue = translation.value;

						//Tmp fix for short name translations > 50 characters
						if (translation.property == "SHORT_NAME") newValue = newValue.substring(0, 50);
						
						obj[propLookup(translation.property)] = newValue;
						translation.value = currentValue;
						translation.locale = currentLocale;

						newTranslations.push(translation);
					}
					else {
						newTranslations.push(translation);
					}
				}
				obj.translations = newTranslations;
			}
		}
	}
	return metadata;
}

function propLookup(translationProperty) {
	switch (translationProperty) {
		case "NAME":
			return "name";
		case "SHORT_NAME":
			return "shortName";
		case "DESCRIPTION":
			return "description";
		default:
			console.log("ERROR: unknown translatable property: " + translationProperty);
			return false;
	}
}


function localeStats(metadata) {
	let stats = {
		"otherObjects": 0,
		"translatableObjects": 0
	};
	for (let type in metadata) {
		for (let obj of metadata[type]) {
			if (obj.hasOwnProperty("translations")) {
				stats.translatableObjects++;
				let objLocales = {};
				for (let translation of obj.translations) {
					objLocales[translation.locale] = true; //translation (full or partial) exist for this object
				}
				for (let locale in objLocales) {
					if (!stats[locale]) {
						stats[locale] = 1;
					}
					else {
						stats[locale]++;
					}
				}
			}
			else {
				stats.otherObjects++;
			}
		}
	}
	return stats;
}


/** FILE OPERATIONS */
function filePath() {
	if (process.argv.length > 2) {
		var filePath = process.argv[2];
	}
	else {
		console.log("No metadata file specified. Use: node app.js metadata.json");
		return false;
	}
	if (fs.existsSync(filePath)) {
		return filePath;
	}
	else {
		console.log("The specified file does not exist.");
		return false;
	}
}

function saveFilePath(filePath) {
	return filePath.replace(".json", "_swapped.json");
}


function readFile(filePath) {
	let fileContent = fs.readFileSync(filePath);
	let metadata;
	try {
		metadata = JSON.parse(fileContent);
	} catch (error) {
		console.log("Problem parsing JSON:");
		console.log(error);
		return false;
	}
	return metadata;
}

function saveFile(metadata, filePath) {
	try {
		fs.writeFileSync(filePath, JSON.stringify(metadata, null, 4));
		console.log("Metadata with swapped translations save to " + filePath);
	} catch (error) {
		console.log("Error saving swapped metadata file.");
		console.log(error);
	}
}


/** UTILITIES */
function allLocaleOptions() {
	let localeOptions = [];
	let all  = allLocales();
	for (let locale of all) {
		localeOptions.push(locale.locale + ": " + locale.name);
	}
	return localeOptions;
}


function availableLocaleOptions(localeStats) {
	var localeOptions = [];
	for (var localeKey in localeStats) {
		if (localeKey != "translatableObjects" && localeKey != "otherObjects") {
			let completeness = (100*localeStats[localeKey]/localeStats["translatableObjects"]).toFixed(1);
			localeOptions.push(localeKey + ": " + localeStats[localeKey] + " objects translated (" + completeness + "%)");
		}
	}
	return localeOptions;
}

function allLocales() {
	return [
	{
		"locale": "ar",
		"name": "Arabic"
	},
	{
		"locale": "ar_EG",
		"name": "Arabic (Egypt)"
	},
	{
		"locale": "ar_IQ",
		"name": "Arabic (Iraq)"
	},
	{
		"locale": "ar_SD",
		"name": "Arabic (Sudan)"
	},
	{
		"locale": "bn",
		"name": "Bengali"
	},
	{
		"locale": "bi",
		"name": "Bislama"
	},
	{
		"locale": "my",
		"name": "Burmese"
	},
	{
		"locale": "zh",
		"name": "Chinese"
	},
	{
		"locale": "da",
		"name": "Danish"
	},
	{
		"locale": "en",
		"name": "English"
	},
	{
		"locale": "fr",
		"name": "French"
	},
	{
		"locale": "in_ID",
		"name": "Indonesian (Indonesia)"
	},
	{
		"locale": "km",
		"name": "Khmer"
	},
	{
		"locale": "rw",
		"name": "Kinyarwanda"
	},
	{
		"locale": "lo",
		"name": "Lao"
	},
	{
		"locale": "mn",
		"name": "Mongolian"
	},
	{
		"locale": "ne",
		"name": "Nepali"
	},
	{
		"locale": "pt",
		"name": "Portuguese"
	},
	{
		"locale": "pt_BR",
		"name": "Portuguese (Brazil)"
	},
	{
		"locale": "ps",
		"name": "Pushto"
	},
	{
		"locale": "ru",
		"name": "Russian"
	},
	{
		"locale": "es",
		"name": "Spanish"
	},
	{
		"locale": "sv",
		"name": "Swedish"
	},
	{
		"locale": "tg",
		"name": "Tajik"
	},
	{
		"locale": "tet",
		"name": "Tetum"
	},
	{
		"locale": "ur",
		"name": "Urdu"
	},
	{
		"locale": "vi",
		"name": "Vietnamese"
	},
	{
		"locale": "ckb",
		"name": "ckb"
	},
	{
		"locale": "prs",
		"name": "prs"
	}
];
}