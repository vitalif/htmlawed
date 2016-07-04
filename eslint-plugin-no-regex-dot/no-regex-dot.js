/**
 * @fileoverview Rule to forbid . in regular expressions (it doesn't match newlines, [\s\S] should be used instead)
 * @author Vitaliy Filippov
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "disallow . in regular expressions",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function(context) {

        /**
         * Get the regex expression
         * @param {ASTNode} node node to evaluate
         * @returns {*} Regex if found else null
         * @private
         */
        function getRegExp(node) {
            if (node.value instanceof RegExp) {
                return node.value;
            } else if (typeof node.value === "string") {

                var parent = context.getAncestors().pop();

                if ((parent.type === "NewExpression" || parent.type === "CallExpression") &&
                    parent.callee.type === "Identifier" && parent.callee.name === "RegExp"
                ) {

                    // there could be an invalid regular expression string
                    try {
                        return new RegExp(node.value);
                    } catch (ex) {
                        return null;
                    }
                }
            }

            return null;
        }

        /**
         * Check if given regex string has . in it
         * @param {String} regexStr regex as string to check
         * @returns {Boolean} returns true if finds control characters on given string
         * @private
         */
        function hasDot(regexStr) {
            return /(^|[^\\])(\\\\)*\./.test(regexStr);
        }

        return {
            Literal: function(node) {
                var computedValue,
                    regex = getRegExp(node);

                if (regex) {
                    computedValue = regex.toString();

                    if (hasDot(computedValue)) {
                        context.report(node, "Unexpected . in regular expression, use [\\s\\S] instead");
                    }
                }
            }
        };

    }
};
