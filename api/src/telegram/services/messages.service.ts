import * as path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  compileLocalizedTemplates,
  FALLBACK_LOCALE,
  LocalizedTemplates,
} from "../../_common/utils/localized-templates";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import {
  GENERATION_READY_TEMPLATE,
  START_TEMPLATE,
  TEMPLATES_DIR,
} from "../constants";

export interface IStartMessage {
  name: string | null;
  balance: number;
}

/**
 * Тексты бота. Живут Handlebars-шаблонами в файловой системе, а не строками в
 * коде (`ARCHITECTURE.md` §6), и компилируются один раз на старте.
 */
@Injectable()
export class MessagesService {
  private readonly start: LocalizedTemplates;
  private readonly generationReady: LocalizedTemplates;

  constructor() {
    const dir = path.join(__dirname, "..", TEMPLATES_DIR);
    this.start = compileLocalizedTemplates(dir, START_TEMPLATE);
    this.generationReady = compileLocalizedTemplates(
      dir,
      GENERATION_READY_TEMPLATE,
    );
  }

  public renderStart(locale: Locale, param: IStartMessage): string {
    return this.start[locale ?? FALLBACK_LOCALE](param);
  }

  public renderGenerationReady(locale: Locale): string {
    return this.generationReady[locale ?? FALLBACK_LOCALE]({});
  }
}
