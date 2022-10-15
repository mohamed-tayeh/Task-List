(function () {
  'use strict';

  // the items need to be in the onload even listener to get the correct values
  // for dimensions for elements
  window.addEventListener('load', function () {
    const user = configs.user;
    const commands = configs.commands;
    const responses = configs.responses;

    const opts = {
      identity: {
        username: user.username,
        password: user.oauth,
      },
      channels: [user.channel],
    };

    const client = new tmi.client(opts);

    client.on('message', onMessageHandler);
    client.on('connected', onConnectedHandler);

    client.connect();

    let taskContainerEl = document.querySelector('#task-container');

    let tasksMap = {};
    let tasksMapFinished = {};
    let tasksDone = 0;
    let tasks = 0;

    // Looping status
    let duplicatesAdded = false;

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
          finalMsg =
            responses.taskFinished1 + senderId + responses.taskFinished2;
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
        const isBroadCaster =
          context['username'].toLowerCase() === user.channel.toLowerCase();
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
     * Adds the task to the map and creates a div with paragraphs of the added task
     * @summary returns true if user task is added; false if user already has a task
     * @param {string} senderId - ID of the div to add
     * @param {string} taskContent - Content of the div to add
     * @author Mohamed Tayeh
     */
    function addTask(senderId, taskContent) {
      // if the user already has a task - no new task
      if (tasksMap.hasOwnProperty(senderId)) return false;

      // Otherwise create a task div
      let taskDiv = document.createElement('div');
      taskDiv.id = senderId;
      taskDiv.classList.add(constants.taskDivClass);

      // Create checkmark
      let checkBoxDiv = document.createElement('div');
      checkBoxDiv.classList.add(constants.checkboxClass);

      let checkBoxInput = document.createElement('input');
      checkBoxInput.type = 'checkbox';
      checkBoxInput.id = `checkbox-${senderId}`;
      checkBoxDiv.appendChild(checkBoxInput);

      let checkBoxLabel = document.createElement('label');
      checkBoxLabel.setAttribute('for', `checkbox-${senderId}`);
      checkBoxDiv.appendChild(checkBoxLabel);

      taskDiv.appendChild(checkBoxDiv);

      // create username
      let senderDiv = document.createElement('div');
      senderDiv.textContent = senderId + ':';
      senderDiv.classList.add(constants.taskSenderClass);
      taskDiv.appendChild(senderDiv);

      // create the task
      let taskContentDiv = document.createElement('div');
      taskContentDiv.textContent = taskContent;

      taskContentDiv.classList.add(constants.taskContentClass);
      taskDiv.appendChild(taskContentDiv);

      // checking if looping and adding it correctly
      let length = getTasksNumber();
      let idsList = Object.keys(tasksMap); // somehow dictionaries keep track of the correct order

      if (length === 0) {
        taskContainerEl.appendChild(taskDiv);
      } else {
        let lastEl = document.getElementById(idsList[length - 1]);

        insertAfter(taskDiv, lastEl);
      }

      // keeps track of the tasks and animation
      tasksMap[senderId] = taskContent;
      tasks++;
      updateTasksNumber();

      let taskWrapperHeight = document.querySelector(
        `.${constants.taskWrapperClass}`
      ).clientHeight;
      let taskContainerHeight = document.querySelector(
        `#${constants.taskContainerId}`
      ).scrollHeight;

      if (taskContainerHeight > taskWrapperHeight && duplicatesAdded) {
        let lastElDuplicate = document.getElementById(
          idsList[length - 1] + constants.cloneLabel
        );

        let taskDivDuplicate = taskDiv.cloneNode(true);
        taskDivDuplicate.id = senderId + constants.cloneLabel;

        taskDivDuplicate.classList.add(constants.cloneLabel);

        insertAfter(taskDivDuplicate, lastElDuplicate);
      }

      // handles infinite scroll
      updateAnimation();

      return true;
    }

    function updateTasksNumber() {
      let tasksNumberDiv = document.getElementById(constants.tasksNumber);
      tasksNumberDiv.textContent = `${tasksDone}/${tasks}`;
    }

    /**
     * Finish the task with the given ID
     * @param {string} senderId - ID of the div to add
     * @author Mohamed Tayeh
     */
    function finishTask(senderId) {
      if (!tasksMap.hasOwnProperty(senderId)) return false;

      let taskDiv = document.getElementById(senderId);
      let checkbox = taskDiv.querySelector(`#checkbox-${senderId}`);
      checkbox.checked = true;
      taskDiv.id = '';
      finishDuplicate(senderId);

      delete tasksMap[senderId];

      tasksDone++;
      updateTasksNumber();

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
        taskContentDiv[0].textContent = taskContent;
        tasksMap[senderId] = taskContent;
        editDuplicate(senderId, taskContent);
        updateAnimation();

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
      tasks--;
      updateTasksNumber();

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
     * Updates the CSS files with the new number of tasks
     * @author Mohamed Tayeh
     */
    function updateAnimation() {
      let style = document.createElement('style');

      let taskContainerHeight = document.querySelector(
        `#${constants.taskContainerId}`
      ).scrollHeight;

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

      // ? not sure why 8 makes it a perfect loop
      // ? maybe because of margin-bottom for the last task
      style.textContent = keyFrames.replace(
        /A_DYNAMIC_VALUE/g,
        -(taskContainerHeight / 2)
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
      let taskWrapperHeight = document.querySelector(
        `.${constants.taskWrapperClass}`
      ).clientHeight;
      let taskContainerHeight = document.querySelector(
        `#${constants.taskContainerId}`
      ).scrollHeight;

      if (taskContainerHeight > taskWrapperHeight && !duplicatesAdded) {
        duplicatesAdded = true;
        startLooping();
      } else if (taskContainerHeight > taskWrapperHeight && duplicatesAdded) {
        // update animation speed if it is already looping
        let taskContainerHeight =
          document.querySelector(`#${constants.taskContainerId}`).scrollHeight /
          2;

        // 25px scroll per second
        document.getElementById(
          constants.taskContainerId
        ).style.animation = `scroll ${
          taskContainerHeight / 20
        }s linear infinite`;
      } else if (taskContainerHeight <= taskWrapperHeight && duplicatesAdded) {
        stopLooping();
      }
    }

    /**
     * Starts looping the task list using CSS Keyframes animation
     * @author Mohamed Tayeh
     */
    function startLooping() {
      addDuplicates();
      // let taskWrapperHeight = document.querySelector(
      //   `.${constants.taskWrapperClass}`
      // ).clientHeight;
      let taskContainerHeight =
        document.querySelector(`#${constants.taskContainerId}`).scrollHeight /
        2;

      // 26px scroll per second
      document.getElementById(
        constants.taskContainerId
      ).style.animation = `scroll ${taskContainerHeight / 25}s linear infinite`;
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
      let taskDivs = taskContainerEl.children;
      const taskDivsLength = taskContainerEl.children.length;

      for (let i = 0; i < taskDivsLength; i++) {
        let taskDivClone = taskDivs[i].cloneNode(true);
        if (taskDivClone.id)
          taskDivClone.id = taskDivClone.id + constants.cloneLabel;
        taskDivClone.classList.add(constants.cloneLabel);
        taskContainerEl.appendChild(taskDivClone);
      }
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
        taskContentDiv[0].textContent = taskContent;
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
      let taskDiv = document.getElementById(senderId + constants.cloneLabel);
      if (!taskDiv) return;
      let checkbox = taskDiv.querySelector(`#checkbox-${senderId}`);
      checkbox.checked = true;
      taskDiv.id = '';
    }

    function getTasksNumber() {
      return Object.keys(tasksMap).length;
    }

    function getIsLooping() {
      let taskWrapperHeight = document.querySelector(
        `.${constants.taskWrapperClass}`
      ).clientHeight;
      let taskContainerHeight = document.querySelector(
        `#${constants.taskContainerId}`
      ).scrollHeight;

      return taskContainerHeight > taskWrapperHeight && duplicatesAdded;
    }

    /**
     * Console logs when the timer connects to the channel
     * @author Mohamed Tayeh
     */
    function onConnectedHandler(addr, port) {
      console.log(`* Connected to ${addr}:${port}`);
    }

    function runTests() {
      for (let i = 0; i < 25; i++) {
        addTask('moh_t' + i.toString(), 'this is not a long task');
      }

      // for (let i = 0; i < 20; i++) {
      //   finishTask('moh_t' + i.toString());
      // }

      // editTask(
      //   'moh_t20',
      //   'this is a long task that i dont think would be able to fit into one line'
      // );

      // deleteTask('moh_t21');

      // for (let i = 0; i < 20; i++) {
      //   addTask('moh_t' + i.toString(), 'this is not a long task');
      // }

      // for (let i = 0; i < 20; i++) {
      //   deleteTask('moh_t' + i.toString());
      // }

      // for (let i = 0; i < 20; i++) {
      //   addTask('moh_t' + i.toString(), 'hi');
      // }

      // setTimeout(() => {
      //   for (let i = 10; i < 30; i++) {
      //     addTask('moh_t' + i.toString(), 'hi');
      //   }
      // }, 2000);

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
      //   addTask('moh_t' + i.toString(), 'vessy sucks KEKW');
      // }

      // for (let i = 0; i < 36; i++) {
      //   editTask(
      //     'moh_t' + i.toString(),
      //     'this is a really long task, i dont even know how this is going to fit in the task list. i cant believe'
      //   );
      // }
    }

    // runTests();
  });
})();
// ! TBD
// tasksTracker = api.getTasksTracker();
// console.log(tasksTracker);

// taskContainerEl = document.getElementById(constants.taskContainerId);

// addTask('moh_t', tasksTracker[0]);
// api.setTasksTracker(tasksTracker);

// ! Deprecated

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
  let newTaskContent = taskDiv.textContent.trim();

  if (taskContentLength <= targetLength) return newTaskContent;

  while (taskContentLength > targetLength) {
    newTaskContent = newTaskContent.substring(0, newTaskContent.length - 1);
    taskDiv.textContent = newTaskContent;
    taskContentLength = taskDiv.offsetWidth;
  }

  return newTaskContent + '...';
}
