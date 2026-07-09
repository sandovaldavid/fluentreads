import fs from 'fs';
import YAML from 'yaml';

const filePath = '/home/sandovaldavid/workspaces/me/projects/fluentreads/public/admin/config.yml';
const fileContent = fs.readFileSync(filePath, 'utf-8');

const config = YAML.parse(fileContent);

function simplifyField(fields) {
  if (!fields) return;
  fields.forEach((field) => {
    // Si es un widget de tipo list y tiene un subcampo 'field' simple de tipo string
    if (field.widget === 'list' && field.field && field.field.widget === 'string') {
      console.log(`Simplificando lista: ${field.label || field.name}`);
      delete field.field; // Borrar la definición anidada para hacerlo lista plana de strings
    }
    // Si tiene campos anidados, procesarlos de forma recursiva
    if (field.fields) {
      simplifyField(field.fields);
    }
  });
}

if (config && config.collections) {
  config.collections.forEach((collection) => {
    if (collection.fields) {
      simplifyField(collection.fields);
    }
    if (collection.files) {
      collection.files.forEach((file) => {
        if (file.fields) {
          simplifyField(file.fields);
        }
      });
    }
  });
}

const newYamlContent = YAML.stringify(config, { indentSeq: true });
fs.writeFileSync(filePath, newYamlContent, 'utf-8');
console.log('Simplificación de campos tipo list completada.');
