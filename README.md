#DHIS2 metadata translation swapper
Tool for modifying translations of a DHIS2 metadata file, swapping a language available as a translation with the main language.

## Installation
`npm install`

## Usage
To run the script: `node app.js metadata.json`

You will be asked to specify the current main language (e.g. English) and choose a locale for which translations are included in the file to set as the main language. The current main language will be included as translations (i.e. they are swapped).

The script will output a new file in the same location as the specified file, with the chosen locale included in the name (for example metadata.json => metadata_fr.json).
