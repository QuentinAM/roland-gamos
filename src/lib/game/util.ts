export function CutTrackName(trackname: string)
{
    // If there is (feat. ...) remove the parenthesis
    const index_of_feat_parenthesis = trackname.indexOf('feat');
    if (index_of_feat_parenthesis > -1)
    {
        // Remove all char after (
        trackname = trackname.substring(0, index_of_feat_parenthesis);
    }

    // Remove everything from the end that is not a letter or digit
    let index = trackname.length - 1;

    while (index >= 0 && !isLetterOrDigit(trackname[index]))
    {
        index--;
    }
    trackname = trackname.substring(0, index + 1);

    return trackname;
}

function isLetterOrDigit(char: string)
{
    return char.match(/[a-zA-Z0-9]/) || char === 'é';
}
