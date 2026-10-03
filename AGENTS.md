# Project Rules

1. Never start the development server on your own.
2. Never install dependencies or libraries on your own. Instead, suggest them to the user, who will install them manually.
3. Focus only on the assigned task, such as adding a feature, refactoring code, or fixing a bug or error.
4. Review the code that is actually written. Code reviews should identify business-logic inconsistencies, errors, bugs, scalability issues, security issues, and similar concrete problems.
5. Do not perform dependency audits, open a browser for testing, run tests, run the application, or perform any other kind of testing on your own. Your job is only to write code and, when needed, write test cases without running them.
6. Follow Conventional Commits format when writing git commit messages: `<type>(<optional-scope>): <short description in imperative mood>`. Choose the type accurately based on the change (`feat`, `fix`, `refactor`, `style`, `build`, `perf`, `docs`, `chore`). When grouping multiple changes, list each item with its own type prefix.
