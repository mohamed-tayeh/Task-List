let configs = (function () {
  'use strict';

  // Authentication and channels - required
  const channel = ''; // your channel
  const username = ''; // bot account
  const oauth = ''; // should be oauth:xxxxxxxxxxxx from the bot account

  const horizontal = false; // true or false
  const headerFontSize = '18px'; // must have px at the end
  const fontSize = '14px'; // must have px at the end
  const height = '565px'; // must have px at the end
  const width = '376px'; // must have px at the end
  const textColor = 'white'; //  hex or name
  const backgroundColor = '#000000'; // hex only
  const backgroundOpacity = 0.5; // 0 to 1 (0 is transparent)
  const checkBoxColor = '#fff'; // hex or name
  const checkBoxSize = '8px'; // must have px at the end
  const tickColor = '#fff'; // hex or name
  const crossOnFinish = true; // true or false
  const pixelsPerSecond = 50; // amount of time to scroll per second
  const chatterColor = ''; // empty '' if you want twitch chat colors, otherwise hex only
  const fontFamily = 'Poppins'; // supports all google fonts - https://fonts.google.com/
  // Please ensure to type it exactly like on the google website

  // Add task commands - please add commands in the exact format
  const addTaskCommands = [
    '!taska',
    '!taskadd',
    '!atask',
    '!addtask',
    '!task',
    '!add',
  ];

  // Delete task commands - please add commands in the exact format
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

  // Edit task commands - please add commands in the exact format
  const editTaskCommands = [
    '!taske',
    '!taskedit',
    '!etask',
    '!edittask',
    '!edit',
  ];

  // Finish task commands - please add commands in the exact format
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
    '!finished',
  ];

  // Check task commands - please add commands in the exact format
  const checkCommands = [
    '!taskc',
    '!taskcheck',
    '!ctask',
    '!checktask',
    '!mytask',
    '!check',
  ];

  // Help commands - please add commands in the exact format
  const helpCommands = ['!taskh', '!taskhelp', '!htask', '!helptask', '!tasks'];

  // Admin delete - please add commands following the exact format
  const adminDeleteCommands = [
    '!taskadel',
    '!adel',
    '!adelete',
    '!admindelete',
  ];

  // Admin clear done - please add commands following the exact format
  const adminClearDoneCommands = [
    '!aclear',
    '!adminclear',
    '!clearadmin',
    '!taskaclear',
  ];

  // Responses
  const taskAdded = 'Task "{task}" has been added {user}';
  const noTaskAdded = 'Looks like you already have "{task}" up there {user}';
  const noTaskContent = 'Try using !add the-task-you-are-working-on {user}';
  const noTaskButEdited = 'No task to edit, but I added "{task}" (: {user}';
  const taskEdited = 'Task edited to "{task}" {user}';
  const taskDeleted = 'Task "{task}" has been deleted, no problemo {user}';
  const modDeletedTasks = "All of the user's tasks have been deleted";
  const taskFinished =
    'Good job on finishing "{task}" {user} - here is a cookie NomNom';
  const taskCheck = '{user} your current task is: "{task}"';
  const noTask = "Looks like you don't have a task up there {user}";
  const noTaskA = 'Looks like there is no task from that user there {user}';
  const notMod = "hhhhhhh you're not a mod {user}";
  const adminClear = 'All done tasks have been cleared';
  const help = `{user} Use the following commands to help you out - !add !delete !edit !done. For mods !adel @user
    or !adel user. There additional aliases as well. If you need any more help, feel free to ping 
    an available mod to assist you!`;

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
    horizontal,
    fontSize,
    headerFontSize,
    crossOnFinish,
    pixelsPerSecond,
    chatterColor,
    checkBoxSize,
  };

  const commands = {
    addTaskCommands,
    deleteTaskCommands,
    editTaskCommands,
    finishTaskCommands,
    helpCommands,
    checkCommands,
    adminDeleteCommands,
    adminClearDoneCommands,
  };

  const responses = {
    taskAdded,
    noTaskAdded,
    noTaskContent,
    taskDeleted,
    taskEdited,
    noTaskButEdited,
    taskFinished,
    taskCheck,
    noTask,
    noTaskA,
    notMod,
    help,
    modDeletedTasks,
    adminClear,
  };

  let module = {};

  module.user = user;
  module.styles = styles;
  module.commands = commands;
  module.responses = responses;

  return module;
})();
