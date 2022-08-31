import * as namingTpl from '../renderer/utils/namingTpl';
import getConfig from '../renderer/utils/config.ts';

// TODO: Add more PATH replacements
test('fill basic template using string', () => {
  const tplStr =
    '{{programPath}}/{{showTitle}}/Season {{seasonNum}}/{{showTitle}} - {{episodeOrTMS}}.{{EXT}}';

  const vars: namingTpl.TemplateVarsType = {
    full: {},
    shortcuts: {
      programPath: getConfig().programPath,
      showTitle: 'testShowTitle',
      seasonNum: 'testSeasonNum',
      episodeOrTMS: 'testEpisodeOrTMS',
    },
  };

  const filledTpl = namingTpl.fillTemplate(tplStr, vars);

  // starts with episode path
  expect(filledTpl).toMatch(new RegExp(`^${getConfig().programPath}*`));

  // stuffing
  expect(filledTpl).toContain(vars.shortcuts.showTitle);
  expect(filledTpl).toContain(vars.shortcuts.seasonNum);
  expect(filledTpl).toContain(vars.shortcuts.episodeOrTMS);

  // ends with mp4
  expect(filledTpl).toMatch(new RegExp(`.mp4$`));
});
