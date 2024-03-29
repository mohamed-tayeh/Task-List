let constants = (function () {
  'use strict';

  let module = {};

  // Class and IDs
  module.mainContainerId = 'main-container';
  module.headerClass = 'header';
  module.taskWrapperClass = 'task-wrapper';
  module.taskContainerId = 'task-container';
  module.titleId = 'title';
  module.tasksNumber = 'tasks-number';
  module.taskDivClass = 'task-div';
  module.taskSenderClass = 'sender';
  module.taskContentClass = 'task-content';
  module.cloneLabel = 'clone';
  module.tasksTrackerName = 'tasksTracker';
  module.tasksTotalName = 'tasksTotal';
  module.checkboxClass = 'checkbox';
  module.horizontalClass = 'horizontal';
  module.colonClass = 'colon';
  module.finishedClass = 'finished';

  // Number of tasks supported
  module.pxCutOffLength = 475;
  module.limitTaskNum = 18;
  module.taskDivHeight = 26;

  return module;
})();
