SNCF Transilien - Voyageons ensemble
====================================
Online version available at [vdaguenet.fr/sncf](http://vdaguenet.fr/sncf).

## Instalation
First, you must install dependencies using the following command
```
npm install
```
Then, you can build the project
```
gulp --env production
```
Finally, past the followings on your server
```
assets/
build/
index.html
```

## Development
### Configuration
You can configure a bit your application in the file `src/common/config.js` (see example below)
```js
module.exports = {
    apiUrl: 'http://my-awesome-api.com',
    useFakeData: false
};
```
When `useFakeData` is set to true, no API call will be done. It's useful if you haven't API or if you want to hide some sensible data.

### Section
Each page of website is called a **section** and have its own directory saved in `src/views/sections`.

- `_section.scss`: Style of the current section written in scss
- `section.html`: Template of the section
- `section.js`: Main logic of the section (API calls, animations, ...)

Sections can use components (`src/views/components`). A component is an independant micro-section. They can be used by several sections or several time in the same section. Components follow the same structure as sections.