let constants = (function () {
  'use strict';

  let module = {};

  // Class and IDs
  module.taskContainerId = 'task-container';
  module.titleId = 'title';
  module.taskDivClass = 'task-div';
  module.taskSenderClass = 'sender';
  module.taskContentClass = 'task-content';
  module.cloneLabel = 'clone';
  module.tasksTrackerName = 'tasksTracker';
  module.tasksTotalName = 'tasksTotal';

  // Number of tasks supported
  module.pxCutOffLength = 475;
  module.limitTaskNum = 18;
  module.taskDivHeight = 26;

  return module;
})();
