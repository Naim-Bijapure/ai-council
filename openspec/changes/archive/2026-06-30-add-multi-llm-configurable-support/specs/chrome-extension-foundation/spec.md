## MODIFIED Requirements

### Requirement: ChatGPT And DeepSeek Host Access
The extension SHALL declare host permissions for all supported apps configured in `config/apps.json`.

#### Scenario: All configured app hosts are permitted
- **WHEN** the Chrome-targeted manifest is generated
- **THEN** the manifest includes host access for every app listed in `config/apps.json` with `enabled: true`

### Requirement: All Supported App Content Script Registration
The extension SHALL register content scripts for all supported apps through the WXT entrypoint structure.

#### Scenario: All content scripts included in build output
- **WHEN** a developer runs the Chrome build
- **THEN** the generated extension output includes a content script entry for each supported app's match patterns

#### Scenario: Unsupported pages are not matched
- **WHEN** the generated content script configuration is inspected
- **THEN** it does not match unrelated websites
