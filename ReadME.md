Task List Criteria:

- Functionality:

2 pomo:

2. Keeps track of how many tasks users did
3. Keeps track of over all tasks
4. Restore tasks option - crash

2 pomo:

1. fix scroll
2. understanding the code

Additional:

1. When adding a task twice, it edits it instead

Non-visual:

1. keep track of how many tasks were finished for each user and overall
2. translate tasks
3. stats command
4. joinmoh - add a timer to the task to join the current pomo
5. pomo - set your own pomo (can also be count down)

Visual:

1. Scrolling - 3
2. Cross through for 2s task then 1s fade

- Todo list:

1. How to keep track of the pomo countdown I have running
2. How to allow people to have their own counters

- Code tasks:

1. How to make my pomo counter into a class that I can use to create many instances of it
   and give each user that wants it an object with it

### Tests

```
for (let i = 0; i < 36; i++) {
  addTask(
    'moh_t' + i.toString(),
    'sdfj[adjfdiajfoiadsjf[iajdsfoijasodjf[d[fijsjdfa[dsofija[djdfssj'
  );
}

console.log(finishTask('moh_t20'));
console.log(finishTask('moh_t10'));
console.log(editTask('moh_t0', 'hello'));

for (let i = 0; i < 23; i++) {
  editTask('moh_t' + i.toString(), 'hello');
}

for (let i = 20; i < 36; i++) {
  deleteTask('moh_t' + i.toString());
}

for (let i = 20; i < 36; i++) {
  addTask('moh_t' + i.toString(), 'hi');
}

for (let i = 0; i < 20; i++) {
  finishTask('moh_t' + i.toString());
}

for (let i = 0; i < 20; i++) {
  addTask('moh_t' + i.toString(), 'vessy sucks KEKW');
}

for (let i = 0; i < 36; i++) {
  editTask(
    'moh_t' + i.toString(),
    'shfdiuapifdshafshiudhfuiashfuphasdifhuisfhuadshpdshsfiudfhaspdfh'
  );
}
```

### Python Translation

```
    // ! Python translation
    // const process = spawn('python3', ['../Custom\ Timer/mohTranslator.py', 'en', taskContent]);

    // process.stdout.on('data', (data) => {
    //   loadedData = JSON.parse(data.toString());

    //   if (loadedData['src'] != 'en') taskContent = loadedData['msgTranslated'];

    //   const added = addTask(senderId, taskContent);
    //   let finalMsg;

    //   if (added) {
    //     finalMsg = taskAdded + senderId + ' ;)';
    //   } else {
    //     finalMsg = noTaskAdded;
    //   }

    //   client.say(target, finalMsg);
    // })

    // process.stderr.on('data', (data) => {
    //   console.log(data.toString());
    //   client.say(target, errMsg);
    // })
```

### Updating

```
/**
 * Loads json data using python script because I spent over an hour googling how to do in vanilla JS\
 * @summary return count of tasks finished; -1 if an error occurs
 * @author Mohamed Tayeh
 */
// function updateJsonCounter(senderId) {
//   const process = spawn('python3', ['taskList.py', senderId]);
//   let result = -1;

//   process.stdout.on('data', (data) => {
//       result = JSON.parse(data.toString());
//   })

//   process.stderr.on('data', (data) => {
//     console.log(data.toString());
//     client.say(target, errMsg);
//   })
//   console.log(result);
//   return result;
// }
```
