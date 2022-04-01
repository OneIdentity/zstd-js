const exec = require('child_process').exec;

module.exports = class Compiler {
  constructor(data) {
    this.mainCmd = 'emcc';
    this.compressType = data.compressType; // -O1 / -O2 / -O3
    this.exportedFunctions = this.createFunctionParameter(data.exportedFunctions);
  }

  compile(input, output, isIECompatible, name) {
    let cmd =
      `${this.mainCmd} ${input} ` +
      `-o ${output} ` +
      `${this.compressType} ` +
      `-s WASM=${isIECompatible ? '0' : '1'} ` +
      `-s LEGACY_VM_SUPPORT=${isIECompatible ? '1' : '0'} ` +
      `-s SINGLE_FILE=1 ` +
      `-s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap', 'addOnInit', 'getValue', 'setValue', 'ALLOC_NORMAL', 'ALLOC_STACK']" ` +
      `-s ASSERTIONS=1 ${this.exportedFunctions} ` +
      `-s ALLOW_MEMORY_GROWTH=1 ` +
      `-s DEMANGLE_SUPPORT=1 ` +
      `-s USE_CLOSURE_COMPILER=1 ` +
      `-s MODULARIZE=1 -s 'EXPORT_NAME="initZstd"'`;

    console.log(`[${name}] Compile started.`);
    exec(cmd, (error, stdout, _) => {
      if (error) console.error(`[${name}] Compile failed: ${error}`);
      else console.log(`[${name}] Compiled successfully.`);
    });
  }

  createFunctionParameter(functionNamesArray) {
    let functions = '';
    functionNamesArray.forEach(functionName => {
      if (functions !== '') functions += `, `;
      functions += `"_${functionName}"`;
    });
    return `-s EXPORTED_FUNCTIONS='[${functions}]'`;
  }
};
