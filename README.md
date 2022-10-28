<h1 align="center">
  Static front-end boilerplate
</h1>


This is a gulp based front-end boilerplate suitable for static multipages websites.

It uses Gulp 4, Twig, Sass, ES6, BrowserSync (including minification for production environment).
It trades on BrowserSync to show code changes in real time. 


## 💻 Requirements 
### [NodeJs](https://nodejs.org/it/)
```
node.js -v
```

### [Npm](https://www.npmjs.com/)
```
npm -v
```
### [Gulp CLI](https://gulpjs.com/docs/en/getting-started/quick-start/)
```
npm install gulp-cli -g
```

## 🚀 **Quick start**

1. **Install the dependencies**

    Running this command npm will download all the required packages into the `node_modules` directory. 
    ```
    npm install
    ```
    

2. **Run Gulp default task**

    This simple line of code will run the default task of the `gulpfile.js`, compiling the boilerplate code generating a `dist` directory.
    ```
    gulp
    ```

## 🏛 **Boilerplate architecture**
After installing and compiling with ``gulp`` the first level of the directories should be like this:

```
    static-fe-boilerplate/
    ├── dist/
    ├── node_modules/
    ├── src/
    ├── .gitignore
    ├── gulp-config.yml
    ├── gulpfile.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    └── README.md
```

+ `dist/`: this directory will contained all the compiled code and compressed assets from `scr/`. It will be created automatically via `gulp`.
+ `node_modules/`: directory containing all the modules that your project depends on. It is created and filled automatically via `npm`.
+ `src/`: this directory contains the source code of the website, including templates, styles, scripts, images and other assets.
+  `.gitignore`: this hidden file provides a set of files and extentions to be excluded from the repository (os files, editors files, etc.). According to best practices `dist` and `node_modules/` dir have been excluded from the repo.
+ `gulp-config.yml`: this file contains all the paths used for compiling pages and assets.
+ `gulpfile.js`: it is the main file defining all the tasks that can be run via Gulp. We will cover the this topic in depth in another section.
+ `index.html`: this file **should not be modified** (it is not the right place to write your code 🙃). It contains just a redirect to the `dist` directory
+ `package.json`: the manifest file for Node.js projects, including metadata (the project’s name, author, etc) and package dependencies for npm.
+ `package-lock.json`: automatically generated file based on the exact versions of npm dependencies that were installed for the current project. This file **should not be modified directly**.
+ `README.md`: text file containing information about the project and how to use it.

## 🍝 **Source code directory** (no more spaghetti code)

In order to provide a higher level of code management a stricht architecture has been proposed for the `scr/` directory. Let's see all the subdirectories and the associated technologies.

```
    src/
    ├── images/
    ├── js/
    ├── scss/
    ├── static/
    ├── twig/
    └── vendors/
```


  ### **Images**
  This is the directory where all the images needed for the website developing have to be put. It can be organized into subdirectories.
  
  There is a reserved directory called `svg/`. All the svg images put in this directory will be processed and joined in a unique final svg files, including the previous original svg images as symbols. This file will be automatically inline-included in the final html file, so that all the svg images can be referenced as symbols. 


  ### **JavaScript**
  The `js/` directory contains all the scripting files, according to JavaScript ES6 standards. 
  
  There is a `main.js` file, which should include and initialize all the classes (theoretically each component should have a specific class for managing its behaviour) stored in the `modules/` subdir.

  ### **Style**
  The `scss/` directory contains all the style files written in Sass. 
  
  The `master.scss` file provides all the inclusions for all the single files in the `scss/` directory.

  There are two main subdirs: `_external/` and `custom/`. 
  
  The first one contains boot files for external modules (eg. `mq` used for managing media queries). 

  All the custom code should be written inside the `custom/` directory, according to best practices.

  ### **Static**
  This directory should contain all that files that do not need any kind of processing, such as external fonts, favicon files and etc.

  ### **Twig**
  This directory contains all the structure markup for the webpages. The markup has to be written using the homonym templating language. 

  All the `.twig` files which are direct children of the `twig/` directory are considered as the main pages of the website. 

  These pages exploit the structure defined in the `layouts/` directory. 

  All the components should be defined inside the subdirectory `partials/`.

  Aiming to better manage structure and content, it is possible to separate markup and data to be used. In order to achive that is is possible to use the yaml file `twig/_data/data.yml` containing all the content do be included in the web pages. While compiling all the variables defined in the twig templates will be resolved and substituted with the relative content defined in the `data.yml` file. 

  ### **Vendors**
  The vendors dir is intended to group all the external vendors libraries (are accepted `.js`, `.css` and `.scss` files). 

  While compiling all the vendors files will be joined into two unique `vendors.css` and `vendors.js` files, which can be included into the web pages. 


## ✨ **Compiling with Gulp tasks**

As already said the `gulpfile.js` (using `gulp-config.yml` for paths) provides some tasks to process the markup and the assets of our web site. 

Running the following command it will be run the default task, providing a complete compiling of the project.

``` 
gulp 
```

Let's start considering all the atomic tasks:

+ `gulp clean`: delete the `dist/` directory.
+ `gulp twig`: compiles the templates of our websites; if the `twig/_data/data.yml` file is present, the compiler will try to resolve variables inside twig according to content. The final pages will be stored into `dist/`.
+ `gulp scss`: it reads all the direct child of `scss/` directory (eg. `master.scss`) and generate a relative css files inside the `dist/assets/css/` directory. During the execution of the task all the scss files will be processed and prefix for crossbrowser compatibile will be added. 
+ `gulp images`: it reads recursively all the images in the `img/` dir (excluding the `svg/` subdir), compresses and copies them inside `dist/assets/images`. The tree structure of the folders is kept valid. _This task can take more time than others_.
+ `gulp svgs`: as said before this task reads all the svg images inside `src/images/svg/` directory, process them and generate a unique final svg files, which includes the previous original svg images as symbols. This file will be automatically inline-included in the final html file, so that all the svg images can be referenced as symbols. 
+ `gulp js`: it reads all the js files which are direct children of `src/js/` and transpile them generating a corresponding javascript file inside `/dist/assets/js/`.
+ `gulp vendors`: as said before all the vendors files contained in this directory will be joined into two unique files (`vendors.css` and `vendors.js`) and stored into `dist/assets/vendors/` directory.
+ `gulp static`: copies recursively all the files inside this directory and make a copy of them inside `dist/assets/`.

There is a special task that needs a deepening.

```
gulp watch
```

Launching this command all the previous tasks will be run parallely (with the exceptio of the `clean` task, which will not be run). After that, the BrowserSync module will run a local server and open a browser window, showing the website project.

Contrary to the other tasks, after lauching this command the process will not end automatically. The process will keep listening to changes in our source files and when detecting one, it will compile again our source code and update independently the browser.

### **Compiling for production env**

It is possible to compile the source code for production environment:

```
gulp taskname --prod
```
When compiling for production environment all the final files will be minified and uglified and no sourcemap will be provided. 