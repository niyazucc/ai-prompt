import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

// Resolve the extensionless TypeScript imports used by Vite in Node's test runner.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.includes('/src/features/prompt-builder/') && specifier.startsWith('.') && !specifier.endsWith('.ts')) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { generatePrompt } = await import('../src/features/prompt-builder/generatePrompt.ts');
const { contentTypes, getInitialValues } = await import('../src/features/prompt-builder/data.ts');
const form = (contentType, activeTab, values = {}) => ({ contentType, activeTab, values: { ...getInitialValues(contentType), ...values }, context: '' });

test('every category offers only 6, 8 and 10 seconds and uses the selection in dialogue and Flow', () => {
  for (const category of contentTypes) {
    assert.deepEqual(category.fields.find((field) => field.id === 'durasi').options, ['6 saat', '8 saat', '10 saat']);
    assert.equal(getInitialValues(category.id).durasi, '8 saat');
    for (const seconds of [6, 8, 10]) {
      for (const tab of category.tabs.filter((tab) => tab !== 'Gambar')) {
        const prompt = generatePrompt(form(category.id, tab, { durasi: `${seconds} saat` }));
        assert.ok(prompt.includes(`${seconds} saat`) || prompt.includes(`${seconds}-second`));
        if (seconds !== 8) assert.doesNotMatch(prompt, /8 saat|8-second/);
        assert.doesNotMatch(prompt, /undefined|\[object Object\]/);
      }
    }
    assert.match(generatePrompt(form(category.id, 'Prompt Flow', { durasi: '20 saat' })), /8 saat|8-second/);
  }
});

test('POV combines problem and demonstration for three scenes and always ends with CTA', () => {
  for (const count of [3, 4, 5, 6]) {
    const prompt = generatePrompt(form('pov', 'Dialog', { scene: `${count} Scene` }));
    assert.ok(prompt.includes(`Scene ${count}: Call To Action`));
    assert.ok(!prompt.includes(`Scene ${count + 1}:`));
    assert.match(prompt, /beg kuning/);
  }
  assert.match(generatePrompt(form('pov', 'Dialog')), /Scene 2: Masalah dan Penyelesaian/);
});

test('animation storyboard generates the selected number of scenes', () => {
  const prompt = generatePrompt(form('animasi', 'Dialog', { scene: '6 Scene' }));
  assert.equal((prompt.match(/^SCENE \d$/gm) ?? []).length, 6);
  assert.match(prompt, /Scene 6 \(Call To Action\)/);
});

test('category-specific images and Flow preserve their visual and sequencing rules', () => {
  for (const category of ['podcast', 'animasi', 'pov', 'goyang']) {
    assert.match(generatePrompt(form(category, 'Gambar')), /NEXT/);
    assert.match(generatePrompt(form(category, 'Gambar')), /9:16/);
  }
  assert.match(generatePrompt(form('pov', 'Gambar')), /Jangan ada muka/);
  assert.match(generatePrompt(form('animasi', 'Gambar')), /70%/);
  assert.match(generatePrompt(form('podcast', 'Prompt Flow')), /microphone/);
  assert.match(generatePrompt(form('pov', 'Prompt Flow')), /Never show face/);
  assert.match(generatePrompt(form('animasi', 'Prompt Flow')), /0 hingga 3 saat/);
  assert.match(generatePrompt(form('goyang', 'Gambar')), /Pilih hook jenis emosi/);
  assert.match(generatePrompt(form('goyang', 'Gambar')), /Setiap gambar.*hook/);
});

test('Shake2 timeline ends at the selected duration and preserves hook throughout', () => {
  for (const seconds of [6, 8, 10]) {
    const prompt = generatePrompt(form('goyang', 'Prompt Flow', { durasi: `${seconds} saat` }));
    const intervals = [...prompt.matchAll(/^(\d+\.\d+)s – (\d+\.\d+)s/gm)];
    assert.equal(intervals.length, 4);
    assert.equal(Number(intervals[0][1]), 0);
    assert.equal(Number(intervals.at(-1)[2]), seconds);
    intervals.forEach((interval, index) => {
      assert.ok(Number(interval[2]) > Number(interval[1]));
      if (index) assert.equal(interval[1], intervals[index - 1][2]);
    });
    assert.match(prompt, /hook visible throughout/);
    assert.match(prompt, /No music\. No sound effects/);
  }
});
