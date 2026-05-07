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
            flex-direction: column;
            align-items: end;
            position: fixed;
            bottom: 0;
            right: 0;
            font-size: 18px;
            color: black;
        }

        .${classes.sentinelStats} {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            background: var(${FSConsts.cssVar.ratingColor});
            transition-duration: 5000ms;
            transition-property: all;
            padding: 5px 10px;
            max-width: 100%;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
        
        .${classes.sentinelStatsHide} {
            display: none;
        }

        .${classes.sentinelRow} {
            display: flex;
            flex-direction: row;
        }

        .${classes.sentinelLabel} {
            display: flex;
            align-items: center;
            font-size: 14px;
            line-height: 1.2;
        }
        .${classes.sentinelNumberOfResourceHints} {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
            background: #fd0100;
            font-weight: bold;
            color: white;
        }
    </style>
`
export default styles
