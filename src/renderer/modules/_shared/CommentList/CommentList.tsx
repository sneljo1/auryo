import * as React from 'react';
import * as ReactList from 'react-list';
import { NormalizedResult } from '../../../../types';
import CommentListItem from './CommentListitem';

interface Props {
    comments: Array<NormalizedResult>;
}

class CommentList extends React.PureComponent<Props> {

    renderItem = (index: number) => {
        const { comments } = this.props;

        const item = comments[index];

        console.log('CommentList render');

        return (
            <CommentListItem
                key={`comment-${item.id}`}
                idResult={item}
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
                />
            </div>
        );
    }
}

export default CommentList;
