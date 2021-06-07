const {knex} = require('knex');
const knexFile = require('../../knexfile').development;
const db = knex(knexFile);

const {funcGetTreeWithId} = require('./funcGetTreeWithID');

const {
  funcDeleteVernacularNameReferenceWithBasicTreeId,
  funcInsertVernacularNameReference,
} = require('../vernacular_name_reference/vernacular_name_reference');

const {
  funcGetAllVernacularName,
} = require('../vernacular_name/vernacular_name');

const TABLENAME = 'basic_tree';

const funcUpdateTreeWithID = async ({
  id,
  scientific_name,
  primary_name,
  vernacular_names,
}) => {
  await db(TABLENAME)
      .where('id', id)
      .update({scientific_name: scientific_name, primary_name: primary_name});

  // delete all vernacular_references to this tree_id
  await funcDeleteVernacularNameReferenceWithBasicTreeId(id);

  // insert new reference

  if (vernacular_names === undefined) {
    vernacular_names = [];
  }
  vernacular_names = JSON.parse(JSON.stringify(vernacular_names));

  if (vernacular_names.length > 0) {
    // get all names in vernacular_names table
    const allVernacularNames = await funcGetAllVernacularName();

    idsToReference = [];
    vernacular_names.map((obj) => {
      idsToReference.push(obj.id);
    });

    const basicTreeId = id;
    await Promise.all(
        // insert vernacular_name_reference ids for this tree
        idsToReference.map(async (vernacular_name_id) => {
          await funcInsertVernacularNameReference({
            vernacular_name_id,
            basicTreeId,
          });
        }),
    );
  }
  return funcGetTreeWithId(id);
};

module.exports = {
  funcUpdateTreeWithID,
};
