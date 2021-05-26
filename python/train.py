import argparse
import json
from typing import Dict

import aaa
import addon
import core.modelbuilder


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('model')
    parser.add_argument('--options', action='store_true')
    parser.add_argument('--summary', action='store_true')
    args = parser.parse_args()
    if args.options:
        print()
        print('Architectures')
        for i in core.modelbuilder.ModelBuilder.ARCHITECTURES.keys():
            print(' - %s' % i)
        print('Data Sets')
        for i in core.modelbuilder.ModelBuilder.DATASETS.keys():
            print(' - %s' % i)
        print('Losses')
        for i in core.modelbuilder.ModelBuilder.LOSSES.keys():
            print(' - %s' % i)
        print('Optimizers')
        for i in core.modelbuilder.ModelBuilder.OPTIMIZERS.keys():
            print(' - %s' % i)
        print('Metrics')
        for i in core.modelbuilder.ModelBuilder.METRICS.keys():
            print(' - %s' % i)
        print()
    with open(args.model) as f:
        settings: Dict[str, str] = json.load(f)
        model = core.modelbuilder.ModelBuilder.create(
            settings['architecture'],
            settings['dataset'],
            settings['loss'],
            settings['optimizer'],
            settings['metrics'],
            settings['epochs'],
            settings['patience'],
        )
        if args.summary:
            model.summary()
        elif 'split' in settings:
            model.split(settings['split']).train()
        else:
            model.train()


if __name__ == '__main__':
    main()
