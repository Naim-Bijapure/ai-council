## ADDED Requirements

### Requirement: Selector Config Files For All Supported Apps
The system SHALL store app-specific DOM selector values in editable JSON config files for every supported app.

#### Scenario: Perplexity selector config exists
- **WHEN** the Perplexity adapter is built
- **THEN** it reads DOM lookup values from a Perplexity JSON selector config file at `config/selectors/perplexity.json`
