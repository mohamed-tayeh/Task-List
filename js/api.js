let api = (function () {
  'use strict';

  let module = {};

  function getTasksTracker() {
    let tasksTracker = localStorage.getItem(constants.tasksTrackerName);
    if (tasksTracker) return JSON.parse(tasksTracker);
    return {
      [constants.tasksTotalName]: 0,
    };
  }

  function setTasksTracker(tasksTracker) {
    localStorage.setItem(
      constants.tasksTrackerName,
      JSON.stringify(tasksTracker)
    );
  }

  module.getTasksTracker = getTasksTracker;
  module.setTasksTracker = setTasksTracker;

  return module;
})();
