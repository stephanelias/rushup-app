// Les fichiers .sql sont importés comme chaînes par babel-plugin-inline-import.
declare module '*.sql' {
  const content: string;
  export default content;
}
