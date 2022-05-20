(function () {
  'use strict';

  const user = configs.user;
  const commands = configs.commands;
  const responses = configs.responses;

  let taskContainerEl;

  let tasksMap = {};
  let tasksDoneToday = 0;
  let tasksTracker;

  // Looping status
  let duplicatesAdded = false;

  const opts = {
    identity: {
      username: user.username,
      password: user.oauth,
    },
    channels: [user.channel],
  };

  /**
   * Recieves messages from chat and detects the command used for the add task overlay
   * @param {ParamDataTypeHere} target
   * @param {ParamDataTypeHere} context
   * @param {string} msg - message sent in chat
   * @param {booleans} self - if the message was sent from this account/bot itself
   * @author Mohamed Tayeh
   */
  function onMessageHandler(target, context, msg, self) {
    if (self) return;

    let messageSplit = msg.trim().split(' ');

    let senderId = context['display-name'].toLowerCase();
    let command = messageSplit[0].toLowerCase();
    let taskContent = messageSplit.slice(1).join(' ');

    if (commands.addTaskCommands.indexOf(command) > -1) {
      if (
        taskContent.length === 0 ||
        taskContent === null ||
        taskContent === undefined
      ) {
        let finalMsg = responses.noTaskContent + senderId;

        client.say(target, finalMsg);
        return;
      }

      let added = addTask(senderId, taskContent);

      let finalMsg;
      if (added) {
        finalMsg = responses.taskAdded + senderId + ' ;)';
      } else {
        finalMsg = responses.noTaskAdded + senderId;
      }

      client.say(target, finalMsg);
    } else if (commands.finishTaskCommands.indexOf(command) > -1) {
      const finished = finishTask(senderId);

      let finalMsg;
      if (finished) {
        finalMsg = responses.taskFinished1 + senderId + responses.taskFinished2;
      } else {
        finalMsg = responses.noTask + senderId;
      }

      client.say(target, finalMsg);
    } else if (commands.editTaskCommands.indexOf(command) > -1) {
      const edited = editTask(senderId, taskContent);

      let finalMsg;
      if (edited) {
        finalMsg = responses.taskEdited + senderId + ' :O';
      } else {
        finalMsg = responses.noTaskButEdited + senderId;
      }

      client.say(target, finalMsg);
    } else if (commands.deleteTaskCommands.indexOf(command) > -1) {
      const deleted = deleteTask(senderId);

      let finalMsg;
      if (deleted) {
        finalMsg = responses.taskDeleted + senderId;
      } else {
        finalMsg = responses.noTask + senderId;
      }

      client.say(target, finalMsg);
    } else if (commands.checkCommands.indexOf(command) > -1) {
      let finalMsg = checkTask(senderId);

      client.say(target, finalMsg);
    } else if (commands.adminDeleteCommands.indexOf(command) > -1) {
      const isMod = context['mod'];
      const isBroadCaster = context['username'] === 'moh__t';
      let finalMsg;

      if (isMod || isBroadCaster) {
        if (senderId.charAt(0) === '@') senderId = senderId.slice(1);

        const deleted = deleteTask(senderId);

        if (deleted) {
          finalMsg = responses.taskDeleted + senderId;
        } else {
          finalMsg = responses.noTaskA + senderId;
        }
      } else {
        finalMsg = responses.notMod + senderId;
      }

      client.say(target, finalMsg);
    } else if (commands.helpCommands.indexOf(command) > -1) {
      let finalMsg = senderId + responses.help;

      client.say(target, finalMsg);
    }
  }

  /**
   * Trims the taskContent to fit the width of the task list
   * @param {string} senderId
   * @return {string} The trimmed task content with ellipsis
   */
  function trimCharLength(senderId) {
    let taskDiv = document.getElementById(senderId);
    let allDiv = taskDiv.querySelectorAll('div');

    const senderIdLength = allDiv[0].offsetWidth;
    const targetLength = constants.pxCutOffLength - senderIdLength;

    taskDiv = allDiv[1];

    let taskContentLength = taskDiv.offsetWidth;
    let newTaskContent = taskDiv.innerHTML.trim();

    if (taskContentLength <= targetLength) return newTaskContent;

    while (taskContentLength > targetLength) {
      newTaskContent = newTaskContent.substring(0, newTaskContent.length - 1);
      taskDiv.innerHTML = newTaskContent;
      taskContentLength = taskDiv.offsetWidth;
    }

    return newTaskContent + '...';
  }

  /**
   * Adds the task to the map and creates a div with paragraphs of the added task
   * @summary returns true if user task is added; false if user already has a task
   * @param {string} senderId - ID of the div to add
   * @param {string} taskContent - Content of the div to add
   * @author Mohamed Tayeh
   */
  function addTask(senderId, taskContent) {
    if (tasksMap.hasOwnProperty(senderId)) {
      editTask(senderId, taskContent);
      return false;
    }

    let taskDiv = document.createElement('div');
    taskDiv.id = senderId;
    taskDiv.classList.add(constants.taskDivClass);

    let senderDiv = document.createElement('div');
    senderDiv.innerHTML = senderId + ':';
    senderDiv.classList.add(constants.taskSenderClass);
    taskDiv.appendChild(senderDiv);

    let taskContentDiv = document.createElement('div');
    taskContentDiv.innerHTML = taskContent;

    taskContentDiv.classList.add(constants.taskContentClass);
    taskDiv.appendChild(taskContentDiv);

    let isLooping = getIsLooping();
    let length = getTasksNumber();
    let idsList = Object.keys(tasksMap);

    if (isLooping) {
      let lastEl = document.getElementById(idsList[length - 1]);

      insertAfter(taskDiv, lastEl);
    } else {
      taskContainerEl.appendChild(taskDiv);
    }

    tasksMap[senderId] = taskContent;

    if (length > constants.limitTaskNum && duplicatesAdded) {
      let lastElDuplicate = document.getElementById(
        idsList[length - 1] + constants.cloneLabel
      );

      let taskDivDuplicate = taskDiv.cloneNode(true);
      taskDivDuplicate.id = senderId + constants.cloneLabel;
      taskDivDuplicate.classList.add(constants.cloneLabel);

      insertAfter(taskDivDuplicate, lastElDuplicate);
    }

    updateAnimation();

    let trimmedTaskContent = trimCharLength(senderId);
    taskContentDiv.innerHTML = trimmedTaskContent;

    editDuplicate(senderId, trimmedTaskContent);
    return true;
  }

  function incrementTasksDoneNumber() {
    tasksDoneToday++;

    let titleDiv = document.getElementById(constants.titleId);
    titleDiv.innerHTML = `!Tasks Finished: ${tasksDoneToday}`;
  }

  /**
   * Finish the task with the given ID
   * @param {string} senderId - ID of the div to add
   * @author Mohamed Tayeh
   */
  function finishTask(senderId) {
    if (!tasksMap.hasOwnProperty(senderId)) return false;

    let taskDiv = document.getElementById(senderId);
    let allDiv = taskDiv.querySelectorAll('div');
    allDiv[0].classList.add('finished');
    allDiv[1].classList.add('finished');

    setTimeout(() => {
      taskDiv.remove();
    }, 2000);

    finishDuplicate(senderId);

    incrementTasksDoneNumber();

    delete tasksMap[senderId];
    updateAnimation();

    return true;
  }

  /**
   * Edits the task with the given ID to exact wording of taskContent
   * @summary returns true if task got edited; false if task with senderId doesn't exist
   * @param {string} senderId - ID of the div to add
   * @param {string} taskContent - Content of the div to add
   * @author Mohamed Tayeh
   */
  function editTask(senderId, taskContent) {
    if (tasksMap.hasOwnProperty(senderId)) {
      let taskDiv = document.getElementById(senderId);
      let taskContentDiv = taskDiv.querySelectorAll(
        `.${constants.taskContentClass}`
      );
      taskContentDiv[0].innerHTML = taskContent;

      let trimmedTaskContent = trimCharLength(senderId);
      taskContentDiv[0].innerHTML = trimmedTaskContent;
      editDuplicate(senderId, trimmedTaskContent);

      return true;
    } else {
      addTask(senderId, taskContent);
      return false;
    }
  }

  /**
   * Deletes the task with the given ID
   * @summary returns true if the task is successfully deleted; return false if there is no task with that ID
   * @param {string} senderId - ID of the div to add
   * @author Mohamed Tayeh
   */
  function deleteTask(senderId) {
    if (!tasksMap.hasOwnProperty(senderId)) return false;

    deleteDuplicate(senderId);

    let taskDiv = document.getElementById(senderId);
    taskDiv.remove();

    delete tasksMap[senderId];

    updateAnimation();

    return true;
  }

  /**
   * Checks the task of the user
   * @author Mohamed Tayeh
   */
  function checkTask(senderId) {
    if (tasksMap.hasOwnProperty(senderId)) {
      return tasksMap[senderId];
    } else {
      return responses.noTask;
    }
  }

  /**
   * Trims the taskContent to fit the width of the task list
   * @param {string} senderId
   * @return {string} The trimmed task content with ellipsis
   * @author Mohamed Tayeh
   */
  function trimCharLength(senderId) {
    let taskDiv = document.getElementById(senderId);
    let allDiv = taskDiv.querySelectorAll('div');

    const senderIdLength = allDiv[0].offsetWidth;
    const targetLength = constants.pxCutOffLength - senderIdLength;

    taskDiv = allDiv[1];

    let taskContentLength = taskDiv.offsetWidth;
    let newTaskContent = taskDiv.innerHTML.trim();

    if (taskContentLength <= targetLength) return newTaskContent;

    while (taskContentLength > targetLength) {
      newTaskContent = newTaskContent.substring(0, newTaskContent.length - 1);
      taskDiv.innerHTML = newTaskContent;
      taskContentLength = taskDiv.offsetWidth;
    }

    return newTaskContent + '...';
  }

  /**
   * Updates the CSS files with the new number of tasks
   * @author Mohamed Tayeh
   */
  function updateAnimation() {
    let style = document.createElement('style');
    style.type = 'text/css';

    let keyFrames =
      '\
      @keyframes scroll {\
          0% {\
              transform: translateY(0);\
          }\
          100% {\
              transform: translateY(A_DYNAMIC_VALUEpx);\
          }\
      }';

    style.innerHTML = keyFrames.replace(
      /A_DYNAMIC_VALUE/g,
      -constants.taskDivHeight * getTasksNumber()
    );

    document.head.appendChild(style);

    document.documentElement.style.setProperty(
      '--number-of-tasks',
      getTasksNumber()
    );

    checkForLooping();
  }

  /**
   * Checks if the task list should loop
   * @author Mohamed Tayeh
   */
  function checkForLooping() {
    let length = getTasksNumber();

    if (length > constants.limitTaskNum && !duplicatesAdded) {
      duplicatesAdded = true;
      startLooping();
    } else if (length <= constants.limitTaskNum && duplicatesAdded) {
      stopLooping();
    }
  }

  /**
   * Starts looping the task list using CSS Keyframes animation
   * @author Mohamed Tayeh
   */
  function startLooping() {
    addDuplicates();
    document.getElementById(constants.taskContainerId).style.animation =
      'scroll 8s linear infinite';
  }

  /**
   * Stops loop animation
   * @author Mohamed Tayeh
   */
  function stopLooping() {
    removeDuplicates();
    document.getElementById(constants.taskContainerId).style.animation = '';
  }

  /**
   * Adds duplicates of the tasks
   * @author Mohamed Tayeh
   */
  function addDuplicates() {
    Object.keys(tasksMap).forEach((senderId) => {
      let taskDiv = document.getElementById(senderId).cloneNode(true);
      taskDiv.id = senderId + constants.cloneLabel;
      taskDiv.classList.add(constants.cloneLabel);
      taskContainerEl.appendChild(taskDiv);
    });
  }

  /**
   * Removes all duplicates of the tasks when stopping the animation
   * @author Mohamed Tayeh
   */
  function removeDuplicates() {
    let allClonedDivs = document.querySelectorAll('.clone');

    if (allClonedDivs.length === 0) return;

    for (let i = 0; i < allClonedDivs.length; i++) {
      allClonedDivs[i].remove();
    }
  }

  /**
   * Used to insert an element right after another element
   * @author Mohamed Tayeh
   */
  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  /**
   * Edits duplicate task
   * @author Mohamed Tayeh
   */
  function editDuplicate(senderId, taskContent) {
    let isLooping = getIsLooping();

    if (isLooping) {
      let taskDiv = document.getElementById(senderId + constants.cloneLabel);
      let taskContentDiv = taskDiv.querySelectorAll(
        `.${constants.taskContentClass}`
      );
      taskContentDiv[0].innerHTML = taskContent;
    }
  }

  /**
   * Deletes the duplicate of the task
   * @author Mohamed Tayeh
   */
  function deleteDuplicate(senderId) {
    let isLooping = getIsLooping();

    if (isLooping) {
      let taskDiv = document.getElementById(senderId + constants.cloneLabel);
      taskDiv.remove();
    }
  }

  /**
   * Finshes the duplicate that is used for the loop animation
   * @author Mohamed Tayeh
   */
  function finishDuplicate(senderId) {
    let isLooping = getIsLooping();

    if (isLooping) {
      let taskDiv = document.getElementById(senderId + constants.cloneLabel);

      let allDiv = taskDiv.querySelectorAll('div');

      allDiv[0].classList.add('finished');
      allDiv[1].classList.add('finished');

      setTimeout(() => {
        taskDiv.remove();
      }, 2000);
    }
  }

  function getTasksNumber() {
    return Object.keys(tasksMap).length;
  }

  function getIsLooping() {
    let length = getTasksNumber();
    return length > constants.limitTaskNum;
  }

  /**
   * Console logs when the timer connects to the channel
   * @author Mohamed Tayeh
   */
  function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  function runTests() {
    for (let i = 0; i < 20; i++) {
      addTask('moh_t' + i.toString(), 'hi');
    }

    setTimeout(() => {
      for (let i = 20; i < 30; i++) {
        addTask('moh_t' + i.toString(), 'hi');
      }
    }, 2000);

    // console.log(finishTask('moh_t20'));
    // console.log(finishTask('moh_t10'));
    // console.log(editTask('moh_t0', 'hello'));

    // for (let i = 0; i < 23; i++) {
    //   editTask('moh_t' + i.toString(), 'hello');
    // }

    // for (let i = 20; i < 36; i++) {
    //   deleteTask('moh_t' + i.toString());
    // }

    // for (let i = 20; i < 36; i++) {
    //   addTask('moh_t' + i.toString(), 'hi');
    // }

    // for (let i = 0; i < 20; i++) {
    //   finishTask('moh_t' + i.toString());
    // }

    // for (let i = 0; i < 20; i++) {
    //   addTask('moh_t' + i.toString(), 'vessy sucks KEKW');
    // }

    // for (let i = 0; i < 36; i++) {
    //   editTask(
    //     'moh_t' + i.toString(),
    //     'shfdiuapifdshafshiudhfuiashfuphasdifhuisfhuadshpdshsfiudfhaspdfh'
    //   );
    // }
  }

  // runTests();

  window.addEventListener('load', function () {
    const client = new tmi.client(opts);

    client.on('message', onMessageHandler);
    client.on('connected', onConnectedHandler);
    client.connect();

    helpers.customStyles();

    tasksTracker = api.getTasksTracker();
    console.log(tasksTracker);

    taskContainerEl = document.getElementById(constants.taskContainerId);

    addTask('moh_t', tasksTracker[0]);
    api.setTasksTracker(tasksTracker);
  });
})();
