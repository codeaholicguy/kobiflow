# Kobiflow


```
  Usage: kobiflow [options] [command]

  Kobiflow - Kobiton workflow. For the first time using this freaking cool tool, please type `kobiflow setup` for setting up the environment


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    start [ticketIds...]  Start working on tickets, open workspace
    commit                Record changes to current workspace
    push                  Push code to Github and auto create pull request
    list                  List all your workspaces
    setup                 Setup kobiflow for the first time
    cleanup               Cleanup workspace
    fix                   Fix review comments, change ticket status
```

## Notice

- For first time using please use `kobiflow setup`
- TicketId is the number part which is next to KOB, e.g To start working with ticket KOB-789 you can type `kobiflow start 789`
