import FSConsts from './FSConsts'

const classes = FSConsts.cssClass

const styles = `
    <style>
        :root    {    
            ${FSConsts.cssVar.ratingColor}: #ccc;
        }   
        .${classes.resourceHint} {
           box-sizing: border-box;
           position: relative;
           pointer-events: none;
        }

        .${classes.resourceHintIcon} {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background: #fd0100;
            color: white;
            font-weight: bold;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            pointer-events: auto;
            border: none;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            padding: 0;
            overflow: hidden;
            transition: width 150ms ease, height 150ms ease, background-color 150ms ease, color 150ms ease;
        }

        .${classes.resourceHintIcon} .${classes.resourceHintContent} {
            display: none;
        }

        .${classes.resourceHintIconMark} {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
        }

        .${classes.resourceHintIconMark} svg {
            width: 100%;
            height: 100%;
            display: block;
        }

        .${classes.resourceHintOpen} .${classes.resourceHintIcon} {
            width: auto;
            height: auto;
            min-width: 24px;
            min-height: 24px;
            padding: 6px 10px;
            background: white;
            color: black;
        }

        .${classes.resourceHintOpen} .${classes.resourceHintIcon} .${classes.resourceHintIconMark} {
            display: none;
        }

        .${classes.resourceHintOpen} .${classes.resourceHintIcon} .${classes.resourceHintContent} {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            line-height: 1.3;
            white-space: nowrap;
        }
        
        .${classes.sentinel} {
            display: flex;
            align-items: center;
            gap: 8px;
            position: fixed;
            bottom: 16px;
            right: 16px;
            padding: 8px 14px;
            border: none;
            border-radius: 999px;
            background: white;
            color: black;
            font-size: 14px;
            font-family: Helvetica, Arial, sans-serif;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.25);
            transition: box-shadow 150ms ease;
        }

        .${classes.sentinel}:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.35);
        }

        .${classes.sentinelButtonDot} {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(${FSConsts.cssVar.ratingColor});
            flex-shrink: 0;
        }

        .${classes.sentinelButtonLabel} {
            white-space: nowrap;
        }

        .${classes.sentinelNumberOfResourceHints} {
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            border-radius: 10px;
            background: #fd0100;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }

        .${classes.modalOverlay} {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 10000;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.5);
            font-family: Helvetica, Arial, sans-serif;
            color: black;
        }

        .${classes.modal} {
            position: relative;
            width: calc(100% - 32px);
            max-width: 640px;
            max-height: calc(100vh - 64px);
            overflow-y: auto;
            background: white;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .${classes.modalClose} {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 50%;
            background: transparent;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
        }

        .${classes.modalClose}:hover {
            background: rgba(0,0,0,0.08);
        }

        .${classes.modalTitle} {
            margin: 0 0 16px;
            font-size: 18px;
        }

        .${classes.modalSubtitle} {
            margin: 24px 0 12px;
            font-size: 15px;
        }

        .${classes.modalSummary},
        .${classes.modalTable} {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .${classes.modalSummary} th,
        .${classes.modalSummary} td,
        .${classes.modalTable} th,
        .${classes.modalTable} td {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid #eee;
        }

        .${classes.modalRatingBadge} {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            padding: 2px 6px;
            margin-right: 6px;
            border-radius: 4px;
            background: var(${FSConsts.cssVar.ratingColor});
            font-weight: bold;
        }

        .${classes.modalEmpty} {
            color: #666;
            font-size: 14px;
        }

        .${classes.modalTableRowClickable} {
            cursor: pointer;
        }

        .${classes.modalTableRowClickable}:hover {
            background: rgba(0,0,0,0.04);
        }

        .${classes.highlight} {
            position: absolute;
            pointer-events: none;
            background: rgba(253, 1, 0, 0.7);
            animation: footprint-sentinel-highlight-fade 1500ms ease 500ms backwards;
        }

        @keyframes footprint-sentinel-highlight-fade {
            0% {
                opacity: 0;
            }
            25% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }
    </style>
`
export default styles
