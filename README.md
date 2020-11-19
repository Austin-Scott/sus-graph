# sus-graph
Keep track of who is accusing who of what in Among Us and unmask imposters.
![screenshot](https://user-images.githubusercontent.com/12504656/99312392-985b0380-2823-11eb-8b45-66791b54dc59.png)
## Keyboard shortcuts

### Color Keys

| Key | Color |
| --- | --- |
| b | Black |
| w | White |
| r | Red |
| p | Purple |
| c | Cyan |
| y | Yellow |
| o | Orange |
| g | Green |
| l | Lime |
| **u** | **Blue** |
| **i** | **Pink** |
| **n** | **Brown** |

### Drawing Sus Lines

  * Pressing two color keys sequentially will draw a sus line from the first color to the second color.
  * Holding shift while pressing two color keys sequentially will draw a "bandwagon" sus line from the first color to the second color.

### Modifying Sus Lines

| Key | Functionality |
| --- | --- |
| f | Deletes the last sus line created |
| v | Change the last sus line into a soft vouch line |
| V | Change the last sus line into a hard vouch line (for example if they claim to have seen them do a visual task) |
| e | Change the last sus line into a sus with soft evidence line (for example faking a task or ignoring a dead body) |
| E | Change the last sus line into a sus with hard evidence line (for example seeing them kill or vent) |

### Marking players

These commands are immediatly followed by a color key for which the command applies to.

| Key | Functionality |
| --- | --- |
| m | Mark the next color key's color as a confirmed crewmate. |
| M | Mark the next color key's color as a confirmed imposter. |
| t | Toggle the next color key's color as dead or alive. |

### Convenience commands

| Syntax | Functionality |
| --- | --- |
| `k` list of color keys `k` | Mark a list of players as dead and (if their role was unknown) crewmate |
| `x` list of color keys `x` | Delete all colors that are not listed in this command and have not been interacted with yet |

