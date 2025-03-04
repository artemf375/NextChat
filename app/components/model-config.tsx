import { ServiceProvider } from "@/app/constant";
import { ModalConfigValidator, ModelConfig } from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { ListItem, List } from "./ui-lib";
import { useAllModels } from "../utils/hooks";
import { groupBy } from "lodash-es";
import styles from "./model-config.module.scss";
import React, { useState } from "react";
import DownIcon from "../icons/down.svg";

// Base component for model selection with provider grouping
export function ModelSelectorBase(props: {
  currentModel: string;
  currentProvider?: string;
  onModelSelect: (model: string, provider: string) => void;
}) {
  const allModels = useAllModels();
  const groupModels = groupBy(
    allModels.filter((v) => v.available),
    "provider.providerName",
  );

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const currentModelObj = allModels.find(
    (m) =>
      m.name === props.currentModel &&
      m.provider?.providerName === props.currentProvider,
  );

  const handleProviderSelect = (providerName: string) => {
    setSelectedProvider(providerName);
  };

  const handleModelSelect = (model: string, providerName: string) => {
    props.onModelSelect(model, providerName);
    setSelectedProvider(null);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedProvider(null);
    }
  };

  // Render the selector content based on state
  const renderContent = () => {
    if (selectedProvider) {
      // Show models for selected provider
      return (
        <div className={styles["provider-model-content"]}>
          <div
            className={styles["provider-header"]}
            onClick={() => setSelectedProvider(null)}
          >
            <span>← {selectedProvider}</span>
          </div>
          <List>
            {groupModels[selectedProvider].map((model, i) => (
              <ListItem
                key={i}
                title={model.displayName}
                onClick={() =>
                  handleModelSelect(
                    model.name,
                    model.provider?.providerName || "",
                  )
                }
              />
            ))}
          </List>
        </div>
      );
    } else {
      // Show provider list
      return (
        <div className={styles["provider-model-content"]}>
          <List>
            {Object.keys(groupModels).map((providerName, i) => (
              <ListItem
                key={i}
                title={providerName}
                subTitle={`${groupModels[providerName].length} models`}
                onClick={() => handleProviderSelect(providerName)}
              />
            ))}
          </List>
        </div>
      );
    }
  };

  return (
    <div className={styles["provider-model-selector"]}>
      <div className={styles["selected-model"]} onClick={toggleDropdown}>
        <span>
          {currentModelObj?.displayName || props.currentModel || "Select Model"}
        </span>
        {props.currentProvider && (
          <span className={styles["provider-name"]}>
            ({props.currentProvider})
          </span>
        )}
        <DownIcon className={styles["dropdown-icon"]} />
      </div>

      {isOpen && (
        <>
          <div
            className={styles["dropdown-backdrop"]}
            onClick={toggleDropdown}
          ></div>
          <div className={styles["dropdown-content"]}>{renderContent()}</div>
        </>
      )}
    </div>
  );
}

// Main model selector component
export function ProviderModelSelector(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const handleModelSelect = (model: string, providerName: string) => {
    props.updateConfig((config) => {
      config.model = ModalConfigValidator.model(model);
      config.providerName = providerName as ServiceProvider;
    });
  };

  return (
    <ModelSelectorBase
      currentModel={props.modelConfig.model}
      currentProvider={props.modelConfig?.providerName}
      onModelSelect={handleModelSelect}
    />
  );
}

// Compress model selector component
export function CompressModelSelector(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const handleModelSelect = (model: string, providerName: string) => {
    props.updateConfig((config) => {
      config.compressModel = ModalConfigValidator.model(model);
      config.compressProviderName = providerName as ServiceProvider;
    });
  };

  return (
    <ModelSelectorBase
      currentModel={props.modelConfig.compressModel}
      currentProvider={props.modelConfig?.compressProviderName}
      onModelSelect={handleModelSelect}
    />
  );
}

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const allModels = useAllModels();
  const groupModels = groupBy(
    allModels.filter((v) => v.available),
    "provider.providerName",
  );
  const value = `${props.modelConfig.model}@${props.modelConfig?.providerName}`;
  const compressModelValue = `${props.modelConfig.compressModel}@${props.modelConfig?.compressProviderName}`;

  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <ProviderModelSelector
          modelConfig={props.modelConfig}
          updateConfig={props.updateConfig}
        />
      </ListItem>
      <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.Temperature.Title}
          value={props.modelConfig.temperature?.toFixed(1)}
          min="0"
          max="1" // lets limit it to 0-1
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.temperature = ModalConfigValidator.temperature(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.TopP.Title}
        subTitle={Locale.Settings.TopP.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.TopP.Title}
          value={(props.modelConfig.top_p ?? 1).toFixed(1)}
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.top_p = ModalConfigValidator.top_p(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.MaxTokens.Title}
        subTitle={Locale.Settings.MaxTokens.SubTitle}
      >
        <input
          aria-label={Locale.Settings.MaxTokens.Title}
          type="number"
          min={1024}
          max={512000}
          value={props.modelConfig.max_tokens}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.max_tokens = ModalConfigValidator.max_tokens(
                  e.currentTarget.valueAsNumber,
                )),
            )
          }
        ></input>
      </ListItem>

      {props.modelConfig?.providerName == ServiceProvider.Google ? null : (
        <>
          <ListItem
            title={Locale.Settings.PresencePenalty.Title}
            subTitle={Locale.Settings.PresencePenalty.SubTitle}
          >
            <InputRange
              aria={Locale.Settings.PresencePenalty.Title}
              value={props.modelConfig.presence_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.presence_penalty =
                      ModalConfigValidator.presence_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.FrequencyPenalty.Title}
            subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
          >
            <InputRange
              aria={Locale.Settings.FrequencyPenalty.Title}
              value={props.modelConfig.frequency_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.frequency_penalty =
                      ModalConfigValidator.frequency_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.InjectSystemPrompts.Title}
            subTitle={Locale.Settings.InjectSystemPrompts.SubTitle}
          >
            <input
              aria-label={Locale.Settings.InjectSystemPrompts.Title}
              type="checkbox"
              checked={props.modelConfig.enableInjectSystemPrompts}
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                    (config.enableInjectSystemPrompts =
                      e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.InputTemplate.Title}
            subTitle={Locale.Settings.InputTemplate.SubTitle}
          >
            <input
              aria-label={Locale.Settings.InputTemplate.Title}
              type="text"
              value={props.modelConfig.template}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.template = e.currentTarget.value),
                )
              }
            ></input>
          </ListItem>
        </>
      )}
      <ListItem
        title={Locale.Settings.HistoryCount.Title}
        subTitle={Locale.Settings.HistoryCount.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.HistoryCount.Title}
          title={props.modelConfig.historyMessageCount.toString()}
          value={props.modelConfig.historyMessageCount}
          min="0"
          max="64"
          step="1"
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.historyMessageCount = e.target.valueAsNumber),
            )
          }
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.CompressThreshold.Title}
        subTitle={Locale.Settings.CompressThreshold.SubTitle}
      >
        <input
          aria-label={Locale.Settings.CompressThreshold.Title}
          type="number"
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.compressMessageLengthThreshold =
                  e.currentTarget.valueAsNumber),
            )
          }
        ></input>
      </ListItem>
      <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
        <input
          aria-label={Locale.Memory.Title}
          type="checkbox"
          checked={props.modelConfig.sendMemory}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.sendMemory = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.CompressModel.Title}
        subTitle={Locale.Settings.CompressModel.SubTitle}
      >
        <CompressModelSelector
          modelConfig={props.modelConfig}
          updateConfig={props.updateConfig}
        />
      </ListItem>
    </>
  );
}
