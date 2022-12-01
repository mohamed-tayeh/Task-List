(function () {
  'use strict';

  const userString = '{user}';
  const taskString = '{task}';

  // the items need to be in the onload even listener to get the correct values
  // for dimensions for elements
  window.addEventListener('load', function () {
    const user = configs.user;
    const commands = configs.commands;
    const responses = configs.responses;
    const styles = configs.styles;
    const style = document.createElement('style');
    document.head.appendChild(style);

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
     */
    function onMessageHandler(target, context, msg, self) {
      if (self) return;

      let messageSplit = msg.trim().split(' ');

      let senderId = context['display-name'].toLowerCase();
      let color = context.color;
      let command = messageSplit[0].toLowerCase();
      let taskContent = messageSplit.slice(1).join(' ');

      if (commands.addTaskCommands.indexOf(command) > -1) {
        if (
          taskContent.length === 0 ||
          taskContent === null ||
          taskContent === undefined
        ) {
          let finalMsg = replaceStrings(responses.noTaskContent, senderId);

          client.say(target, finalMsg);
          return;
        }

        let added = addTask(senderId, taskContent, color);

        let finalMsg;
        if (added) {
          finalMsg = replaceStrings(responses.taskAdded, senderId, taskContent);
        } else {
          // there already exists a task
          let task = tasksMap[senderId];
          finalMsg = replaceStrings(responses.noTaskAdded, senderId, task);
        }

        client.say(target, finalMsg);
      } else if (commands.finishTaskCommands.indexOf(command) > -1) {
        let task = tasksMap[senderId];
        const finished = finishTask(senderId);

        let finalMsg;
        if (finished) {
          finalMsg = replaceStrings(responses.taskFinished, senderId, task);
        } else {
          finalMsg = replaceStrings(responses.noTask, senderId);
        }

        client.say(target, finalMsg);
      } else if (commands.editTaskCommands.indexOf(command) > -1) {
        const edited = editTask(senderId, taskContent, color);

        let finalMsg;
        if (edited) {
          finalMsg = replaceStrings(
            responses.taskEdited,
            senderId,
            taskContent
          );
        } else {
          // no task to edit but adds it anyway
          finalMsg = replaceStrings(
            responses.noTaskButEdited,
            senderId,
            taskContent
          );
        }

        client.say(target, finalMsg);
      } else if (commands.deleteTaskCommands.indexOf(command) > -1) {
        let task = tasksMap[senderId]; // original task or undefined
        const deleted = deleteTask(senderId);

        let finalMsg;
        if (deleted) {
          finalMsg = replaceStrings(responses.taskDeleted, senderId, task);
        } else {
          // no task
          finalMsg = replaceStrings(responses.noTask, senderId);
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
          if (taskContent.charAt(0) === '@') taskContent = taskContent.slice(1);
          taskContent = taskContent.toLowerCase();
          let task = tasksMap[taskContent];
          const deleted = deleteAllDivsFromSender(taskContent);

          if (deleted) {
            finalMsg = replaceStrings(
              responses.modDeletedTasks,
              senderId,
              task
            );
          } else {
            finalMsg = replaceStrings(responses.noTaskA, senderId);
          }
        } else {
          finalMsg = replaceStrings(responses.notMod, senderId);
        }

        client.say(target, finalMsg);
      } else if (commands.helpCommands.indexOf(command) > -1) {
        let finalMsg = replaceStrings(responses.help, senderId);
        client.say(target, finalMsg);
      }
    }

    /**
     * Adds the task to the map and creates a div with paragraphs of the added task
     * @summary returns true if user task is added; false if user already has a task
     * @param {string} senderId - ID of the div to add
     * @param {string} taskContent - Content of the div to add
     * @param {string} color - color of sender
     */
    function addTask(senderId, taskContent, color = undefined) {
      // if the user already has a task - no new task
      if (tasksMap.hasOwnProperty(senderId)) return false;

      // Otherwise create a task div
      let taskDiv = document.createElement('div');
      taskDiv.id = senderId;
      taskDiv.classList.add(constants.taskDivClass);
      if (styles.horizontal) taskDiv.classList.add(constants.horizontalClass);

      // Create checkmark
      let checkBoxDiv = document.createElement('div');
      checkBoxDiv.classList.add(constants.checkboxClass);
      if (styles.horizontal)
        checkBoxDiv.classList.add(constants.horizontalClass);

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
      senderDiv.textContent = senderId;
      senderDiv.classList.add(constants.taskSenderClass);
      senderDiv.style.color = styles.chatterColor ? styles.chatterColor : color;
      if (styles.horizontal) senderDiv.classList.add(constants.horizontalClass);
      taskDiv.appendChild(senderDiv);

      // create colon
      let colonDiv = document.createElement('div');
      colonDiv.textContent = ':';
      colonDiv.classList.add(constants.colonClass);
      if (styles.horizontal) colonDiv.classList.add(constants.horizontalClass);
      taskDiv.appendChild(colonDiv);

      // create the task
      let taskContentDiv = document.createElement('div');
      taskContentDiv.textContent = taskContent;
      taskContentDiv.classList.add(constants.taskContentClass);
      if (styles.horizontal)
        taskContentDiv.classList.add(constants.horizontalClass);
      taskDiv.appendChild(taskContentDiv);

      let firstCloneEl = document.querySelector(`.${constants.cloneLabel}`);

      if (firstCloneEl) {
        firstCloneEl.parentNode.insertBefore(taskDiv, firstCloneEl);
      } else {
        taskContainerEl.appendChild(taskDiv);
      }

      // keeps track of the tasks and animation
      tasksMap[senderId] = taskContent;
      tasks++;
      updateTasksNumber();

      let taskWrapperLength;
      let taskContainerLength;

      if (styles.horizontal) {
        taskWrapperLength = document.querySelector(
          `.${constants.taskWrapperClass}`
        ).clientWidth;
        taskContainerLength = document.querySelector(
          `#${constants.taskContainerId}`
        ).scrollWidth;
      } else {
        taskWrapperLength = document.querySelector(
          `.${constants.taskWrapperClass}`
        ).clientHeight;
        taskContainerLength = document.querySelector(
          `#${constants.taskContainerId}`
        ).scrollHeight;
      }

      // checks if it is looping and duplicates the tasks accordingly
      if (taskContainerLength > taskWrapperLength && duplicatesAdded) {
        let taskDivDuplicate = taskDiv.cloneNode(true);
        taskDivDuplicate.id = senderId + constants.cloneLabel;

        taskDivDuplicate.classList.add(constants.cloneLabel);
        taskContainerEl.appendChild(taskDivDuplicate);
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
      if (styles.crossOnFinish) {
        let taskContent = taskDiv.querySelector(
          `.${constants.taskContentClass}`
        );
        taskContent.classList.add(constants.finishedClass);
      }
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
     */
    function editTask(senderId, taskContent, color) {
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
        addTask(senderId, taskContent, color);
        return false;
      }
    }

    /**
     * Deletes the task with the given ID
     * @summary returns true if the task is successfully deleted; return false if there is no task with that ID
     * @param {string} senderId - ID of the div to add
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
     */
    function checkTask(senderId) {
      if (tasksMap.hasOwnProperty(senderId)) {
        return replaceStrings(
          responses.taskCheck,
          senderId,
          tasksMap[senderId]
        );
      } else {
        return replaceStrings(responses.noTask, senderId);
      }
    }

    /**
     * Updates the CSS files with the new number of tasks
     */
    function updateAnimation() {
      if (styles.horizontal) {
        // only set the animation when the document is ready
        const scrollEffect = setInterval(function () {
          if (document.readyState !== 'complete') return;
          clearInterval(scrollEffect);
          let taskContainerWidth = document.querySelector(
            `#${constants.taskContainerId}`
          ).scrollWidth;

          let keyFrames =
            '\
          @keyframes scroll {\
              0% {\
                  transform: translateX(0);\
              }\
              100% {\
                  transform: translateX(A_DYNAMIC_VALUEpx);\
              }\
          }';

          style.textContent = keyFrames.replace(
            /A_DYNAMIC_VALUE/g,
            getIsLooping() ? -(taskContainerWidth / 2) : -taskContainerWidth
          );
        }, 100);
      } else {
        const scrollEffect = setInterval(function () {
          if (document.readyState !== 'complete') return;
          clearInterval(scrollEffect);

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

          style.textContent = keyFrames.replace(
            /A_DYNAMIC_VALUE/g,
            -(taskContainerHeight / 2)
          );
        }, 100);
      }

      document.documentElement.style.setProperty(
        '--number-of-tasks',
        getTasksNumber()
      );

      checkForLooping();
    }

    /**
     * Checks if the task list should loop
     */
    function checkForLooping() {
      if (styles.horizontal) {
        let taskWrapperWidth = document.querySelector(
          `.${constants.taskWrapperClass}`
        ).clientWidth;
        let taskContainerWidth = document.querySelector(
          `#${constants.taskContainerId}`
        ).scrollWidth;

        if (taskContainerWidth > taskWrapperWidth && !duplicatesAdded) {
          duplicatesAdded = true;
          startLooping();
        } else if (taskContainerWidth > taskWrapperWidth && duplicatesAdded) {
          // update animation loop if it is already looping
          let taskContainerWidth =
            document.querySelector(`#${constants.taskContainerId}`)
              .scrollWidth / 2;

          document.getElementById(
            constants.taskContainerId
          ).style.animation = `scroll ${
            taskContainerWidth / styles.pixelsPerSecond
          }s linear infinite`;
        } else if (taskContainerWidth <= taskWrapperWidth) {
          stopLooping();
        }
      } else {
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
          // update animation loop if it is already looping
          let taskContainerHeight =
            document.querySelector(`#${constants.taskContainerId}`)
              .scrollHeight / 2;

          document.getElementById(
            constants.taskContainerId
          ).style.animation = `scroll ${
            taskContainerHeight / styles.pixelsPerSecond
          }s linear infinite`;
        } else if (taskContainerHeight <= taskWrapperHeight) {
          stopLooping();
        }
      }
    }

    /**
     * Starts looping the task list using CSS Keyframes animation
     */
    function startLooping() {
      addDuplicates();

      if (styles.horizontal) {
        // only set the animation when the document is ready
        const animationSpeed = setInterval(function () {
          if (document.readyState !== 'complete') return;
          clearInterval(animationSpeed);
          let taskContainerWidth =
            document.querySelector(`#${constants.taskContainerId}`)
              .scrollWidth / 2;
          // 25px scroll per second
          document.getElementById(
            constants.taskContainerId
          ).style.animation = `scroll ${
            taskContainerWidth / styles.pixelsPerSecond
          }s linear infinite`;
        }, 100);
      } else {
        let taskContainerHeight =
          document.querySelector(`#${constants.taskContainerId}`).scrollHeight /
          2;

        // 25px scroll per second
        document.getElementById(
          constants.taskContainerId
        ).style.animation = `scroll ${
          taskContainerHeight / styles.pixelsPerSecond
        }s linear infinite`;
      }
    }

    /**
     * Stops loop animation
     */
    function stopLooping() {
      removeDuplicates();
      document.getElementById(constants.taskContainerId).style.animation = '';
      duplicatesAdded = false;
    }

    /**
     * Adds duplicates of the tasks
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
     */
    function removeDuplicates() {
      let allClonedDivs = document.querySelectorAll('.clone');

      if (allClonedDivs.length === 0) return;

      for (let i = 0; i < allClonedDivs.length; i++) {
        allClonedDivs[i].remove();
      }
    }

    /**
     * Edits duplicate task
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
     */
    function finishDuplicate(senderId) {
      let taskDiv = document.getElementById(senderId + constants.cloneLabel);
      if (!taskDiv) return;
      let checkbox = taskDiv.querySelector(`#checkbox-${senderId}`);
      checkbox.checked = true;
      taskDiv.id = '';
      if (styles.crossOnFinish) {
        let taskContent = taskDiv.querySelector(
          `.${constants.taskContentClass}`
        );
        taskContent.classList.add(constants.finishedClass);
      }
    }

    function getTasksNumber() {
      return Object.keys(tasksMap).length;
    }

    function replaceStrings(msg, senderId = '', taskContent = '') {
      if (senderId === undefined) senderId = '';
      if (taskContent === undefined) taskContent = '';

      return msg.replace(userString, senderId).replace(taskString, taskContent);
    }

    function getIsLooping() {
      let taskWrapperLength;
      let taskContainerLength;

      if (styles.horizontal) {
        taskWrapperLength = document.querySelector(
          `.${constants.taskWrapperClass}`
        ).clientWidth;
        taskContainerLength = document.querySelector(
          `#${constants.taskContainerId}`
        ).scrollWidth;
      } else {
        taskWrapperLength = document.querySelector(
          `.${constants.taskWrapperClass}`
        ).clientHeight;
        taskContainerLength = document.querySelector(
          `#${constants.taskContainerId}`
        ).scrollHeight;
      }

      return taskContainerLength > taskWrapperLength && duplicatesAdded;
    }

    function deleteAllDivsFromSender(senderId) {
      const taskDivs = document.getElementsByClassName(constants.taskDivClass);
      let numDeleted = 0;
      let numDoneDeleted = 0;

      Array.from(taskDivs).forEach((taskDiv) => {
        const senderDiv = taskDiv.getElementsByClassName(
          constants.taskSenderClass
        )[0];

        if (senderDiv.textContent === senderId) {
          taskDiv.remove();

          let checkbox = taskDiv.querySelector(`#checkbox-${senderId}`);

          if (!taskDiv.classList.contains(constants.cloneLabel)) {
            if (checkbox.checked) {
              numDoneDeleted += 1;
            }

            numDeleted += 1;
          }
        }
      });

      tasksDone -= numDoneDeleted;
      tasks -= numDeleted;
      delete tasksMap[senderId];
      updateTasksNumber();
      updateAnimation();

      return numDeleted > 0;
    }

    /**
     * Console logs when the timer connects to the channel
     */
    function onConnectedHandler(addr, port) {
      console.log(`* Connected to ${addr}:${port}`);
    }

    async function sleep(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }

    async function runTests() {
      // ? Color test
      // let colors = ['red', 'blue', 'yellow', 'green', 'pink', 'purple'];
      // let names = ['moh', 'zee', 'limon', 'mohfocus', 'mileevili', 'roro'];
      // for (let i = 0; i < 6; i++) {
      //   addTask(names[i], 'this is not a long task', colors[i]);
      //   finishTask(names[i]);
      // }
      // for (let i = 0; i < 6; i++) {
      //   addTask(names[i], 'this is not a long task', colors[i]);
      //   finishTask(names[i]);
      // }
      // for (let i = 0; i < 6; i++) {
      //   addTask(names[i], 'this is not a long task', colors[i]);
      // }
      // for (let i = 0; i < 20; i++) {
      //   addTask('sussybaka', 'this is a task', 'red');
      //   await sleep(500);
      //   finishTask('sussybaka');
      // }
      // // ? Adding tasks test
      // for (let i = 0; i < 20; i++)
      //   addTask('moh_t' + i.toString(), 'this is a task');
      // await sleep(2000);
      // // ? Finishing tasks test
      // for (let i = 0; i < 10; i++) finishTask('moh_t' + i.toString());
      // await sleep(2000);
      // ? Edit non-exist task test
      // editTask(
      //   'moh_t20',
      //   'this is a long task that will not fit in oneline that it will need to be split into two'
      // );
      // ? Delete non-exist task test
      // deleteTask('moh_t21');
      // ? adding more tasks
      // for (let i = 0; i < 20; i++)
      //   addTask('moh_t' + i.toString(), 'this is not a long task');
      // ? deleting the previous tasks
      // for (let i = 0; i < 20; i++) deleteTask('moh_t' + i.toString());
      // ? adding tasks after a delay
      // await sleep(2000);
      //   for (let i = 20; i < 30; i++) addTask('moh_t' + i.toString(), 'hi');
      // ? Add and immediately finish tasks test
      // for (let i = 0; i < 20; i++) {
      //   addTask('moh_t' + i.toString(), 'this is a task');
      //   finishTask('moh_t' + i.toString());
      // }
    }

    runTests();
  });
})();
// ! TBD
// tasksTracker = api.getTasksTracker();
// console.log(tasksTracker);

// taskContainerEl = document.getElementById(constants.taskContainerId);

// addTask('moh_t', tasksTracker[0]);
// api.setTasksTracker(tasksTracker);
