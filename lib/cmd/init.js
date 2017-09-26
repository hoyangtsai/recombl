const debug = require('debug')('nodinx-cli');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const updater = require('npm-updater');
const mkdirp = require('mkdirp');
const Command = require('../command');
const pkgInfo = require('../../package.json');
const helper = require('../util/helper');

class InitCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: nodx init [dir] [options]';
    this.options = {
      type: {
        type: 'string',
        desc: 'biolerplate type ',
      },
      template: {
        desc: 'local path to biolerplate',
        type: 'string',
      },
      package: {
        desc: 'biolerplate package name',
        type: 'string',
      },
      projectName: {
        desc: 'project name',
        alias: 'p',
        type: 'string',
      },
      userName: {
        desc: 'your rtx name',
        alias: 'u',
        type: 'string',
      },
      dir: {
        desc: 'target directory',
        type: 'string',
      },
      registry: {
        desc: 'npm registry, support tnpm/china/npm, default to use tnpm',
        alias: 'r',
        type: 'string',
        default: 'http://t.tnpm.oa.com',
      },
      silent: {
        desc: 'don\'t ask, just use default value',
        type: 'boolean',
      },
      force: {
        desc: 'force to override directory',
        alias: 'f',
        type: 'boolean',
        default: false,
      },
      'no-install': {
        desc: 'dont not install npm packages',
        type: 'boolean',
        default: false,
      },
      needUpdate: {
        desc: 'need update nodinx-cli',
        type: 'boolean',
        default: false,
      },
    };
    this.pkgInfo = pkgInfo;
    this.configName = '@tencent/nodinx-init-config';
  }

  get description() {
    return 'Run init template project';
  }

  * run(ctx) {
    const {
      cwd,
      argv,
      env,
    } = ctx;
    debug('current dir is [%s], argv is [%o], env is [%o]', cwd, argv, env);
    this.registryUrl = helper.getRegistryByType(argv.registry);
    debug('use registry [%s]', this.registryUrl);

    if (argv.needUpdate) {
      yield updater({
        package: this.pkgInfo,
        registry: this.registryUrl,
        level: 'major',
      });
    }
    this.targetDir = yield this.findTargetDir();
  }

  * findTemplateDir() {
    const { argv, cwd } = this.context;
    let templateDir;

    // TODO
  }

  * findTargetDir() {
    const {
      argv,
      cwd,
    } = this.context;
    const dir = argv._[0] || argv.dir || '';
    let targetDir = path.resolve(cwd, dir);
    const isValid = this.validateTargetDir(targetDir, argv.force);
    if (!isValid) {
      const answer = yield this.inquirer.prompt({
        name: 'dir',
        message: 'Please enter a valid target dir: ',
        default: dir || '.',
        filter: dir => path.resolve(cwd, dir),
        validate: dir => this.validateTargetDir(dir, argv.force),
      });
      targetDir = answer.dir;
    }
    this.log(`Target directory is ${targetDir}`);
    return targetDir;
  }

  validateTargetDir(dir, force) {
    // create dir if not exist
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir);
      return true;
    }

    // just a file
    if (!fs.statsSync(dir).isDirectory()) {
      this.log(`${dir} already exists as a file`.red);
      return false;
    }

    // check if directory is empty
    const files = fs.readdirSync(dir).filter(name => name[0] !== '.');
    if (files.length > 0) {
      if (force) {
        this.log(`${dir} already exists and will be override due to --force option`.red);
        return true;
      }
      this.log(`${dir} already exists and not empty: ${JSON.stringify(files)}`.red);
      return false;
    }

    return true;
  }
}

module.exports = InitCommand;
