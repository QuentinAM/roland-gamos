export function CutTrackName(trackname: string)
{
    // If there is (feat. ...) remove the parenthesis
    const index_of_feat_parenthesis = trackname.indexOf('(feat.');
    if (index_of_feat_parenthesis > -1)
    {
        // Remove all char after (
        trackname = trackname.substring(0, index_of_feat_parenthesis);
    }
    return trackname;
}