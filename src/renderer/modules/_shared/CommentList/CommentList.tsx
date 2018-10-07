import * as React from 'react';
import * as ReactList from 'react-list';
import { SoundCloud } from '../../../../types';
import CommentListItem from './CommentListitem';
import { isEqual } from 'lodash';

interface Props {
    comments: Array<SoundCloud.Comment>;
}

class CommentList extends React.Component<Props> {

    shouldComponentUpdate(nextProps: Props) {
        const { comments } = this.props;

        return !isEqual(comments, nextProps.comments);
    }


    renderItem = (index: number) => {
        const { comments } = this.props;

        const comment = comments[index];

        console.log('CommentList render');

        return (
            <CommentListItem
                key={`comment-${comment.id}`}
                comment={comment}
            />
        );
    }

    render() {
        const { comments } = this.props;

        const items = comments || [];

        return (
            <div className='comments'>
                <ReactList
                    pageSize={8}
                    type='simple'
                    length={items.length}
                    itemRenderer={this.renderItem}
                    useTranslate3d={true}
                    threshold={400}
                />
            </div>
        );
    }
}

export default CommentList;
