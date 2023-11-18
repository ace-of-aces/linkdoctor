# Link Doctor 🔗🩺

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

*no more broken links!*

**Link Doctor** is a little CLI tool that searches for URLs/links in any plain text file, checks their HTTP response codes and reports back any failing ones.


>Particularly useful for identifying broken links in READMEs and [awesome-lists](https://github.com/topics/awesome-list)! 🤓

**Features:**
- 📝 Supports any plain text file
- 🌐 Supports HTTP and HTTPS links
- 🛠 Options for customizing which status codes are considered successful or failing
- 📄 Plain text output option for easy integration into other tools and workflows (e.g. CI)
- 💅🏻 Pretty logs and results
- 📦 Easy to install and use

By default, any status codes in the 200-299 range are considered successful, any other status code is considered a failure.

## Installation

// TODO

## Usage

```bash
$ linkdoctor
# Run with default options on README.md in current directory

$ linkdoctor <path-to-file>
# Run with default options on a file

$ linkdoctor --fail 201
# Fail on 201 status codes

$ linkdoctor --pass 403
# Consider 403 status codes to be successful

$ linkdoctor --only 200
# Only consider 200 status codes as successful
```

>A full list of options can be found by running `linkdoctor --help`.

## Contributing

// TODO

## License

[MIT](./LICENSE) © Julian Schramm
