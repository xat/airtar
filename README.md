# airtar

airtar is a tiny wrapper around [airpaste](https://github.com/mafintosh/airpaste) and [tar-fs](https://github.com/mafintosh/tar-fs). It can be used
to send multiple files within your local network without knowing the IP or hostname of the receiver.
Basicly it does the same as calling `tar c . | airpaste` on the sender-side and `airpaste | tar x`
on the receiver-side. On top it adds some sugar like displaying the transfer rate.

### usage on the sender side:

```
// transfer the files from the current directory
airtar .

// but you can also choose which files and directories you want to transfer
airtar file1.txt file2.txt

// ...or use globs
airtar *.js

// call airpaste with a namespace
airtar -n foo .
```

### usage on the receiver side:

```
// receive files and save them in the current directory
airtar -r .

// or define a target dir
airtar -r ./target

// ...use a namespace
airtar -r -n foo .

// explicity overwrite existing files
airtar -r -o .
```

### security notice

`airtar` is meant to be run in a trusted network. The transfered data is not crypted in
anyway and you won't be able to verify who sent it.

### installation

`npm install airtar -g`


## License
Copyright (c) 2015 Simon Kusterer
Licensed under the MIT license.
