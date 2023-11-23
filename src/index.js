#! /usr/bin/env node

import path from 'node:path'
import fs from 'node:fs'
import input from '@inquirer/input'
import select from '@inquirer/select'
import confirm from '@inquirer/confirm'
import chalk from 'chalk'
import download from 'download-git-repo'
import ora from 'ora'

import { emptyDir, isValidPackageName } from './utils/commonUtils.js'

console.log(
  chalk.cyanBright('Create a project using'),
  chalk.greenBright('SpreadJS v16'),
)

async function askProjectInfo() {
  let projectName
  try {
    projectName = await input({
      message: 'Project name',
      default: 'spreadjs-project',
    })
  } catch (e) {
    if (e.message.includes('User force closed')) {
      process.exit()
    } else {
      throw new Error(e)
    }
  }

  if (!isValidPackageName(projectName)) {
    console.log(chalk.redBright('The project name is invalid !'))
    process.exit()
  }

  let templateName
  try {
    templateName = await select({
      message: 'Choose a template',
      choices: [
        {
          name: 'Vue3 SpreadJS Project',
          value: 'vue3-spread-and-designer-template',
          description: 'A Vue3 project with Spread and Designer',
        },
        {
          name: 'React SpreadJS Project',
          value: 'react-spread-and-designer-template',
          description: 'A React project with Spread and Designer',
        },
        {
          name: 'Pure JS SpreadJS with CDN Project',
          value: 'purejs-spread-and-designer-cdn-template',
          description:
            'A pure javascript project with SpreadJS and designer using CDN',
        },
      ],
    })
  } catch (e) {
    if (e.message.includes('User force closed')) {
      process.exit()
    } else {
      throw new Error(e)
    }
  }
  return { projectName, templateName }
}

async function checkTargetDir(targetPath) {
  // 目标文件夹是否已存在
  if (fs.existsSync(targetPath)) {
    // 询问是否清空
    let whetherEmptyDirOrNot

    try {
      whetherEmptyDirOrNot = await confirm({
        message:
          'The directory is existed! Are you sure you want to create project here?',
        default: false,
      })
    } catch (e) {
      if (e.message.includes('User force closed')) {
        process.exit()
      } else {
        throw new Error(e)
      }
    }

    if (whetherEmptyDirOrNot) {
      emptyDir(targetPath)
    } else {
      console.log(
        chalk.redBright('Please run the command again to create project'),
      )
      process.exit()
    }
  } else {
    try {
      fs.mkdirSync(targetPath)
    } catch (e) {
      console.log(
        chalk.redBright(
          'Failed to create the directory, please check your access',
        ),
      )
      process.exit()
    }
  }
}

function downloadTemplate(targetPath, answer) {
  console.log(answer.templateName)
  //TODO: 根据选项决定拉取哪个模板
  const spinner = ora('Downloading...').start()
  download(
    `github:ExcellentDavid/${answer.templateName}`,
    targetPath,
    (err) => {
      if (err) {
        spinner.fail('Error： download template failed')
        process.exit()
      }
      spinner.succeed(`Succeed：your project is generated in ${targetPath}`)
      console.log('Now run:')
      console.log(chalk.greenBright(`cd ${answer.projectName}`))
      console.log(chalk.greenBright(`do anything you want`))
    },
  )
}

async function main() {
  const answer = await askProjectInfo()
  const targetPath = path.resolve(process.cwd(), answer.projectName)
  await checkTargetDir(targetPath)
  downloadTemplate(targetPath, answer)
}

main()
