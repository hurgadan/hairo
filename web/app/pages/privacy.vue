<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <h1 class="mt-6 font-display text-3xl text-text">
      Политика обработки данных
    </h1>
    <p class="mt-2 text-sm text-text-muted">
      Обновлено: 2026. Мы обрабатываем ваше фото, чтобы подобрать причёску и
      показать примерку — здесь подробно о том, как именно.
    </p>

    <section class="mt-6">
      <h2 class="font-display text-xl text-text">1. Кто мы</h2>
      <p class="mt-2 text-sm text-text-muted">
        Hairo — сервис примерки причёсок. Оператор данных: Igor Deutsch,
        Hardtstr. 31A, 79618 Rheinfelden, Германия. Контактный email по
        вопросам обработки данных и для запроса удаления аккаунта:
        <a href="mailto:hurgadan@gmail.com" class="underline">hurgadan@gmail.com</a>.
        Реквизиты оператора — в
        <NuxtLink to="/impressum" class="underline">Impressum</NuxtLink>.
      </p>
    </section>

    <section class="mt-6">
      <h2 class="font-display text-xl text-text">2. Какие данные собираем</h2>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
        <li>Загруженное селфи и сгенерированные фото с примеркой причёски.</li>
        <li>
          Автоопределённые по фото характеристики: форма лица, длина/текстура/
          густота волос, гендер-подача.
        </li>
        <li>Данные аккаунта: email или Telegram-профиль, язык интерфейса.</li>
        <li>История генераций и баланс примерок.</li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="font-display text-xl text-text">3. Основание обработки</h2>
      <p class="mt-2 text-sm text-text-muted">
        Фото лица — чувствительные данные, мы обрабатываем их только с вашего
        явного согласия (чекбокс на экране загрузки). Мы не используем фото
        для чего-либо, кроме подбора причёски и генерации примерки, и не
        передаём их третьим лицам в рекламных целях.
      </p>
    </section>

    <section class="mt-6">
      <h2 class="font-display text-xl text-text">4. Кому передаём данные</h2>
      <p class="mt-2 text-sm text-text-muted">
        Для анализа фото и генерации примерки мы используем Google AI (модели
        семейства Gemini). Наш аккаунт разработчика зарегистрирован в ЕС,
        поэтому, по текущим условиям Google, ваши фото не используются для
        обучения моделей — это правило распространяется на аккаунты из
        ЕЭЗ/Швейцарии/Великобритании даже на бесплатной квоте. Условия
        провайдеров периодически меняются, актуальную версию мы отслеживаем
        отдельно от этого документа.
      </p>
      <p class="mt-2 text-sm text-text-muted">
        Фото хранятся на S3-совместимом хранилище с размещением в регионе ЕС
        (Cloudflare R2, юрисдикция EU).
      </p>
    </section>

    <section class="mt-6">
      <h2 class="font-display text-xl text-text">5. Сроки хранения</h2>
      <p class="mt-2 text-sm text-text-muted">
        Исходные селфи и сгенерированные результаты хранятся, пока аккаунт
        активен. Если аккаунт неактивен <strong class="text-text">30 дней</strong>
        подряд (нет новых загрузок, генераций и входов), все его фото и
        результаты генераций автоматически и безвозвратно удаляются вместе с
        файлами в хранилище.
      </p>
    </section>

    <section class="mt-6">
      <h2 class="font-display text-xl text-text">6. Ваши права</h2>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
        <li>Удалить конкретное фото — доступно прямо в приложении в любой момент.</li>
        <li>
          Запросить полное удаление аккаунта и всех связанных данных — по
          контакту из раздела 1.
        </li>
        <li>Запросить копию своих данных или уточнить детали обработки — там же.</li>
      </ul>
    </section>

    <section class="mt-6 mb-4">
      <h2 class="font-display text-xl text-text">7. Изменения политики</h2>
      <p class="mt-2 text-sm text-text-muted">
        Если политика существенно изменится, мы обновим эту страницу и дату
        в начале документа.
      </p>
    </section>
  </div>
</template>
