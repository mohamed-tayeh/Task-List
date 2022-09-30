let configs = (function () {
  'use strict';

  // Authentication and channels - required
  const channel = ''; // your channel
  const username = ''; // bot account
  const oauth = ''; // should be oauth:xxxxxxxxxxxx from the bot account

  const height = '570px';
  const width = '376px';
  const textColor = 'white'; //  hex or name
  const backgroundColor = '#000000'; // hex only
  const backgroundOpacity = 0.5; // 0 to 1 (0 is transparent)
  const checkBoxColor = '#fff'; // hex or name
  const tickColor = '#fff'; // hex or name
  const fontFamily = 'Poppins';
  // supports all google fonts - https://fonts.google.com/
  // Please ensure to type it exactly like on the google website

  // Add task commands
  const addTaskCommands = [
    '!taska',
    '!taskadd',
    '!atask',
    '!addtask',
    '!task',
    '!add',
  ];

  // Delete task commands
  const deleteTaskCommands = [
    '!taskdel',
    '!taskdelete',
    '!deltask',
    '!deletetask',
    '!taskr',
    '!taskremove',
    '!rtask',
    '!removetask',
    '!remove',
    '!delete',
  ];

  // Edit task commands
  const editTaskCommands = [
    '!taske',
    '!taskedit',
    '!etask',
    '!edittask',
    '!edit',
  ];

  // Finish task commands
  const finishTaskCommands = [
    '!taskf',
    '!taskfinish',
    '!ftask',
    '!finishtask',
    '!taskd',
    '!taskdone',
    '!donetask',
    '!dtask',
    '!finish',
    '!done',
  ];

  // Check task commands
  const checkCommands = [
    '!taskc',
    '!taskcheck',
    '!ctask',
    '!checktask',
    '!mytask',
    '!check',
  ];

  // Help commands
  const helpCommands = ['!taskh', '!taskhelp', '!htask', '!helptask', '!tasks'];

  // Admin delete
  const adminDeleteCommands = ['!taskadel'];

  // Responses
  const taskAdded = 'Task has been added ';
  const noTaskAdded = 'Looks like you already have a task up there ';
  const noTaskContent = 'Try using !taska <the-task-you-are-working-on> ';
  const noTaskButEdited =
    "Looks like you didn't have a task to edit, no worries tho I gotchu ";
  const taskEdited = 'Task has been edited ';
  const taskDeleted = 'Task has been deleted, no problemo ';
  const taskFinished1 = 'Good job on finishing your task ';
  const taskFinished2 = ' SeemsGood Here is a cookie NomNom';
  const noTask = "Looks like you don't have a task up there ";
  const noTaskA = 'Looks like there is no task from that user there ';
  const notMod = "hhhhhhh you're not a mod ";
  const help =
    ' Use the following commands to help you out - !taska (add) ' +
    '!taskdel (delete) !taske (edit) !taskf (finish). There ' +
    'additional aliases as well. If you need any more help, ' +
    'feel free to ping an available mod to assist you!';

  const user = {
    channel,
    username,
    oauth,
  };

  const styles = {
    textColor,
    backgroundColor,
    backgroundOpacity,
    height,
    width,
    checkBoxColor,
    tickColor,
    fontFamily,
  };

  const commands = {
    addTaskCommands,
    deleteTaskCommands,
    editTaskCommands,
    finishTaskCommands,
    helpCommands,
    checkCommands,
    adminDeleteCommands,
  };

  const responses = {
    taskAdded,
    noTaskAdded,
    noTaskContent,
    taskDeleted,
    taskEdited,
    noTaskButEdited,
    taskFinished1,
    taskFinished2,
    noTask,
    noTaskA,
    notMod,
    help,
  };

  let module = {};

  module.user = user;
  module.styles = styles;
  module.commands = commands;
  module.responses = responses;

  return module;
})();
