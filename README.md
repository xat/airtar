# airtar

airtar is a tiny wrapper around [airpaste](https://github.com/mafintosh/airpaste) and tar. It can be used
to send multiple files within your local network without knowing the IP or hostname of the receiver.
Basicly it does the same as calling `tar c . | airpaste` on the sender-side and `airpaste | tar x`
on the receiver-side. On top it adds some sugar like displaying the transfer rate.

### usage on the sender side:

```
// by default airtar transfers all files in the current directory
airtar

// this does the same
airtar .

// but you can also choose which files and directories you want to transfer
airtar file1.txt file2.txt

// ...or use globs
airtar *.js

// call airpaste with a namespace
airtar --namespace foo
```

### usage on the receiver side:

```
// receive files and save them in the current directory
// NOTICE: existing files with the same name will silently be overwritten
airuntar

// or define a target dir
airuntar ./target

// or use a namespace
airuntar --namespace foo
```

### installation

`npm install airtar -g`


## License
Copyright (c) 2015 Simon Kusterer
Licensed under the MIT license.
