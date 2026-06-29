## ADDED Requirements

### Requirement: DeepSeek Selector Config Usage
The DeepSeek judge adapter SHALL use the DeepSeek selector JSON config for DOM lookup values.

#### Scenario: Selector config is loaded
- **WHEN** the DeepSeek content script initializes
- **THEN** it loads the DeepSeek selector config before readiness or judge prompt submission

#### Scenario: Required selector group missing
- **WHEN** the DeepSeek selector config is missing a required selector group
- **THEN** the adapter returns a readable config error instead of attempting DOM automation

### Requirement: DeepSeek Readiness Detection
The DeepSeek judge adapter SHALL detect whether a DeepSeek page is usable for judge prompt submission.

#### Scenario: Judge input is available
- **WHEN** the DeepSeek page contains a usable prompt input matched by selector config within the 10-second grace period
- **THEN** the adapter reports itself ready for judge automation

#### Scenario: DeepSeek is not usable
- **WHEN** the DeepSeek page does not expose a usable prompt input because of login, loading, or unexpected DOM state
- **THEN** the adapter reports a clear readiness failure instead of accepting a judge prompt command

### Requirement: DeepSeek Judge Prompt Submission
The DeepSeek judge adapter SHALL submit the generated judge prompt to DeepSeek through the page UI.

#### Scenario: Judge prompt is injected and sent
- **WHEN** the background sends a DeepSeek judge command with a generated judge prompt
- **THEN** the adapter writes the judge prompt into the DeepSeek input and triggers the send action using configured selectors

#### Scenario: Send control is disabled
- **WHEN** the judge prompt cannot be submitted because the send control stays disabled within 3 seconds
- **THEN** the adapter returns an error with reason `send_button_disabled`

### Requirement: DeepSeek Send Confirmation Only
The DeepSeek judge adapter SHALL confirm the judge prompt was sent without waiting for or extracting the judge response.

#### Scenario: Message sent confirmed
- **WHEN** the send button click succeeds and the URL begins to change or the response container appears in the DOM
- **THEN** the adapter reports a send-confirmation success without returning judge response text

#### Scenario: No judge response captured
- **WHEN** the judge prompt has been sent and confirmed
- **THEN** the adapter does not wait for generation completion, does not extract judge response text, and does not return judge response text to the background
